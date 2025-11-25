import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BattleService, RoundActions } from './battle.service';

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
  async handleRoundActions(
    @MessageBody() data: { battleId: string; actions: RoundActions },
    @ConnectedSocket() client: Socket,
  ) {
    const { battleId, actions } = data;

    try {
      const roundResult = await this.battleService.processRound(
        battleId,
        actions,
      );

      this.server.to(battleId).emit('round-complete', roundResult);

      const battle = await this.battleService.getBattle(battleId);

      if (!battle) {
        client.emit('error', { message: 'Battle not found' });
        return;
      }

      if (battle.status !== 'active') {
        this.server.to(battleId).emit('battle-end', {
          status: battle.status,
          battle,
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