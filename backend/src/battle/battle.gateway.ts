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

// Логирование CORS настроек для отладки
if (process.env.NODE_ENV === 'production') {
  console.log('[BattleGateway] CORS origins:', corsOrigins.length > 0 ? corsOrigins : ['http://localhost:5173']);
}

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

    // Вычисляем turnNumber - количество ходов с текущим мобом
    const currentMonsterRounds = battle.rounds.filter(r => r.roundNumber === battle.currentMonster);
    const turnNumber = currentMonsterRounds.length + 1;

    client.emit('round-start', {
      roundNumber: battle.currentMonster,  // Раунд = номер моба (1-5)
      turnNumber,  // Ход внутри раунда
      playerHp: battle.characterHp,
      monsterHp: battle.monsterHp,
      currentMonster: battle.currentMonster,
      totalMonsters: battle.totalMonsters,
      dungeonId: battle.dungeonId,
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

        const battleEndData = {
          status: battle.status,
          lootedItems: fullBattle?.lootedItems || [],
          expGained: fullBattle?.expGained || 0,
          goldGained: fullBattle?.goldGained || 0,
        };

        console.log('📤 Отправка battle-end события:', {
          battleId,
          status: battleEndData.status,
          lootedItemsCount: battleEndData.lootedItems.length,
          lootedItems: battleEndData.lootedItems,
          expGained: battleEndData.expGained,
          goldGained: battleEndData.goldGained,
        });

        this.server.to(battleId).emit('battle-end', battleEndData);
      } else {
        setTimeout(() => {
          // Вычисляем turnNumber для следующего хода
          const nextMonsterRounds = battle.rounds.filter(r => r.roundNumber === battle.currentMonster);
          const nextTurnNumber = nextMonsterRounds.length + 1;

          this.server.to(battleId).emit('round-start', {
            roundNumber: battle.currentMonster,  // Раунд = номер моба (1-5)
            turnNumber: nextTurnNumber,  // Ход внутри раунда
            playerHp: battle.characterHp,
            monsterHp: battle.monsterHp,
            currentMonster: battle.currentMonster,
            totalMonsters: battle.totalMonsters,
            dungeonId: battle.dungeonId,
          });
        }, 1000);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  handleDisconnect(client: Socket) {
  }
}