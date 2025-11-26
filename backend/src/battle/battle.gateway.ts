import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { BattleService, RoundActions } from './battle.service';
import { RoundActionsDto } from './dto/round-actions.dto';

const corsOriginsString = process.env.CORS_ORIGINS || '';
const corsOrigins = corsOriginsString.split(',').filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:5173'],
    credentials: true,
  },
})
export class BattleGateway {
  @WebSocketServer()
  server: Server;

  constructor(private battleService: BattleService) {}

  @SubscribeMessage('join-battle')
  async handleJoinBattle(
    @MessageBody() data: { battleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { battleId } = data;

    client.join(battleId);

    const battle = await this.battleService.getBattle(battleId);

    if (!battle) {
      client.emit('error', { message: 'Battle not found' });
      return;
    }

    if (battle.status !== 'active') {
      client.emit('battle-end', {
        status: battle.status,
        battle,
      });
      return;
    }

    client.emit('round-start', {
      roundNumber: battle.rounds.length + 1,
      playerHp: battle.characterHp,
      monsterHp: battle.monsterHp,
      currentMonster: battle.currentMonster,
      totalMonsters: battle.totalMonsters,
    });
  }

  @SubscribeMessage('round-actions')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleRoundActions(
    @MessageBody() data: { battleId: string; actions: RoundActionsDto },
    @ConnectedSocket() client: Socket,
  ) {
    const { battleId, actions } = data;

    try {
      // Преобразуем валидированный DTO в тип RoundActions для сервиса
      const roundActions: RoundActions = {
        attacks: [actions.attacks[0], actions.attacks[1]],
        defenses: [actions.defenses[0], actions.defenses[1], actions.defenses[2]],
      };

      const roundResult = await this.battleService.processRound(
        battleId,
        roundActions,
      );

      this.server.to(battleId).emit('round-complete', roundResult);

      const battle = await this.battleService.getBattle(battleId);

      if (!battle) {
        client.emit('error', { message: 'Battle not found' });
        return;
      }

      if (battle.status !== 'active') {
        // Получаем полную информацию о бое для отправки лута
        const fullBattle = await this.battleService.getBattleWithLoot(battleId);

        this.server.to(battleId).emit('battle-end', {
          status: battle.status,
          lootedItems: fullBattle?.lootedItems || [],
          expGained: fullBattle?.expGained || 0,
          goldGained: fullBattle?.goldGained || 0,
        });
      } else {
        setTimeout(() => {
          this.server.to(battleId).emit('round-start', {
            roundNumber: battle.rounds.length + 1,
            playerHp: battle.characterHp,
            monsterHp: battle.monsterHp,
            currentMonster: battle.currentMonster,
            totalMonsters: battle.totalMonsters,
          });
        }, 2000);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  handleDisconnect(client: Socket) {
  }
}