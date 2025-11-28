import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PvpService } from './pvp.service';
import { PvpActionsDto } from './dto/pvp.dto';

const corsOriginsString = process.env.CORS_ORIGINS || '';
const corsOrigins = corsOriginsString.split(',').filter(Boolean);

// Логирование CORS настроек для отладки
if (process.env.NODE_ENV === 'production') {
  console.log('[PvpGateway] CORS origins:', corsOrigins.length > 0 ? corsOrigins : ['http://localhost:5173']);
}

@WebSocketGateway({
  cors: {
    origin: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:5173'],
    credentials: true,
  },
  namespace: 'pvp',
})
export class PvpGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private socketToCharacter: Map<string, number> = new Map(); // socketId -> characterId

  constructor(private pvpService: PvpService) {}

  handleDisconnect(client: Socket) {
    const characterId = this.socketToCharacter.get(client.id);
    if (characterId) {
      // Удаляем из очереди при отключении
      this.pvpService.leaveQueue(characterId);
      this.socketToCharacter.delete(client.id);
    }
  }

  @SubscribeMessage('join_queue')
  async handleJoinQueue(
    @MessageBody() data: { characterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId } = data;

    // Сохраняем связь сокета и персонажа
    this.socketToCharacter.set(client.id, characterId);

    const result = await this.pvpService.joinQueue(characterId, client.id);

    // Если это объект матча, значит нашли противника
    if ('id' in result && 'player1' in result) {
      const match = result;

      // Отправляем обоим игрокам информацию о начале матча
      this.server.to(match.player1.socketId).emit('match_found', {
        matchId: match.id,
        opponent: {
          characterId: match.player2.characterId,
        },
        yourHp: match.player1.maxHp,
        opponentHp: match.player2.maxHp,
      });

      this.server.to(match.player2.socketId).emit('match_found', {
        matchId: match.id,
        opponent: {
          characterId: match.player1.characterId,
        },
        yourHp: match.player2.maxHp,
        opponentHp: match.player1.maxHp,
      });

      return { status: 'match_found', matchId: match.id };
    }

    // Иначе игрок добавлен в очередь
    const queueCount = this.pvpService.getQueueCount();
    return { status: 'in_queue', position: queueCount };
  }

  @SubscribeMessage('leave_queue')
  handleLeaveQueue(
    @MessageBody() data: { characterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId } = data;
    const removed = this.pvpService.leaveQueue(characterId);

    if (removed) {
      this.socketToCharacter.delete(client.id);
      return { status: 'left_queue' };
    }

    return { status: 'not_in_queue' };
  }

  @SubscribeMessage('submit_actions')
  async handleSubmitActions(
    @MessageBody() data: { characterId: number; actions: PvpActionsDto },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId, actions } = data;
    console.log('Received submit_actions:', { characterId, actions });

    const result = await this.pvpService.submitActions(
      characterId,
      actions.attacks,
      actions.defenses,
    );

    // Если есть результат раунда - отправляем обоим игрокам
    if (result.roundResult) {
      const match = this.pvpService.getMatchByCharacterId(characterId);
      if (match) {
        // Отправляем результат раунда обоим игрокам
        this.server.to(match.player1.socketId).emit('round_result', {
          ...result.roundResult,
          yourHp: match.player1.hp,
          opponentHp: match.player2.hp,
          matchFinished: result.matchFinished,
          winner: result.winner,
          youWon: result.winner === match.player1.characterId,
        });

        this.server.to(match.player2.socketId).emit('round_result', {
          ...result.roundResult,
          yourHp: match.player2.hp,
          opponentHp: match.player1.hp,
          matchFinished: result.matchFinished,
          winner: result.winner,
          youWon: result.winner === match.player2.characterId,
        });
      }
    }

    return { status: 'actions_submitted' };
  }

  @SubscribeMessage('get_queue_status')
  handleGetQueueStatus() {
    return {
      queueCount: this.pvpService.getQueueCount(),
      activeMatches: this.pvpService.getActiveMatchesCount(),
    };
  }
}
