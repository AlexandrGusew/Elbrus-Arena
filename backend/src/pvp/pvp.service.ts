import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatsCalculator } from '../character/utils/stats-calculator';
import { CombatCalculator } from '../battle/utils/combat-calculator';
import type { Zone } from '../../../shared/types/battle.types';

interface QueuePlayer {
  characterId: number;
  socketId: string;
  joinedAt: Date;
}

interface PvpMatch {
  id: string;
  player1: {
    characterId: number;
    socketId: string;
    hp: number;
    maxHp: number;
    actions?: { attacks: [Zone, Zone]; defenses: [Zone, Zone, Zone] };
  };
  player2: {
    characterId: number;
    socketId: string;
    hp: number;
    maxHp: number;
    actions?: { attacks: [Zone, Zone]; defenses: [Zone, Zone, Zone] };
  };
  roundNumber: number;
  status: 'waiting' | 'active' | 'finished';
  winner?: number;
  roundTimer?: NodeJS.Timeout;
  roundStartTime?: number;
}

@Injectable()
export class PvpService {
  private queue: QueuePlayer[] = [];
  private matches: Map<string, PvpMatch> = new Map();
  private playerMatches: Map<number, string> = new Map(); // characterId -> matchId

  constructor(private prisma: PrismaService) {}

  // Добавление игрока в очередь
  async joinQueue(characterId: number, socketId: string): Promise<QueuePlayer | PvpMatch> {
    // Проверка, не в игре ли уже
    if (this.playerMatches.has(characterId)) {
      const matchId = this.playerMatches.get(characterId);
      const match = this.matches.get(matchId!);
      if (match) {
        return match;
      }
    }

    // Проверка, не в очереди ли уже
    const existingInQueue = this.queue.find(p => p.characterId === characterId);
    if (existingInQueue) {
      return existingInQueue;
    }

    const player: QueuePlayer = {
      characterId,
      socketId,
      joinedAt: new Date(),
    };

    this.queue.push(player);

    // Попытка создать матч
    if (this.queue.length >= 2) {
      return await this.createMatch();
    }

    return player;
  }

  // Удаление игрока из очереди
  leaveQueue(characterId: number): boolean {
    const index = this.queue.findIndex(p => p.characterId === characterId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  // Создание матча между двумя игроками
  private async createMatch(): Promise<PvpMatch> {
    if (this.queue.length < 2) {
      throw new BadRequestException('Not enough players in queue');
    }

    const player1 = this.queue.shift()!;
    const player2 = this.queue.shift()!;

    const char1 = await this.prisma.character.findUnique({
      where: { id: player1.characterId },
      include: {
        inventory: {
          include: {
            items: {
              where: { isEquipped: true },
              include: { item: true }
            }
          }
        },
        specialization: true
      },
    });

    const char2 = await this.prisma.character.findUnique({
      where: { id: player2.characterId },
      include: {
        inventory: {
          include: {
            items: {
              where: { isEquipped: true },
              include: { item: true }
            }
          }
        },
        specialization: true
      },
    });

    if (!char1 || !char2) {
      throw new BadRequestException('Character not found');
    }

    const equippedItems1 = char1.inventory?.items || [];
    const equippedItems2 = char2.inventory?.items || [];

    const maxHp1 = StatsCalculator.calculateMaxHP(char1);
    const maxHp2 = StatsCalculator.calculateMaxHP(char2);

    const matchId = `pvp_${Date.now()}_${player1.characterId}_${player2.characterId}`;

    const match: PvpMatch = {
      id: matchId,
      player1: {
        characterId: player1.characterId,
        socketId: player1.socketId,
        hp: maxHp1,
        maxHp: maxHp1,
      },
      player2: {
        characterId: player2.characterId,
        socketId: player2.socketId,
        hp: maxHp2,
        maxHp: maxHp2,
      },
      roundNumber: 1,
      status: 'active',
    };

    this.matches.set(matchId, match);
    this.playerMatches.set(player1.characterId, matchId);
    this.playerMatches.set(player2.characterId, matchId);

    return match;
  }

  // Получение матча по ID персонажа
  getMatchByCharacterId(characterId: number): PvpMatch | null {
    const matchId = this.playerMatches.get(characterId);
    if (!matchId) return null;
    return this.matches.get(matchId) || null;
  }

  // Сохранение действий игрока
  async submitActions(
    characterId: number,
    attacks: Zone[],
    defenses: Zone[],
  ): Promise<{ roundResult?: any; matchFinished?: boolean; winner?: number }> {
    const matchId = this.playerMatches.get(characterId);
    if (!matchId) {
      throw new BadRequestException('Player not in match');
    }

    const match = this.matches.get(matchId);
    if (!match || match.status !== 'active') {
      throw new BadRequestException('Match not active');
    }

    // Сохраняем действия игрока
    if (match.player1.characterId === characterId) {
      match.player1.actions = {
        attacks: attacks as [Zone, Zone],
        defenses: defenses as [Zone, Zone, Zone]
      };
    } else if (match.player2.characterId === characterId) {
      match.player2.actions = {
        attacks: attacks as [Zone, Zone],
        defenses: defenses as [Zone, Zone, Zone]
      };
    } else {
      throw new BadRequestException('Player not in this match');
    }

    // Если оба игрока отправили действия - обрабатываем раунд
    if (match.player1.actions && match.player2.actions) {
      return this.processRound(match);
    }

    return {}; // Ждем второго игрока
  }

  // Обработка раунда
  private async processRound(match: PvpMatch) {
    console.log(`[PVP] Processing round ${match.roundNumber} for match ${match.id}`);
    console.log(`[PVP] Player1 HP: ${match.player1.hp}/${match.player1.maxHp}, Player2 HP: ${match.player2.hp}/${match.player2.maxHp}`);

    const char1 = await this.prisma.character.findUnique({
      where: { id: match.player1.characterId },
      include: {
        inventory: {
          include: {
            items: {
              where: { isEquipped: true },
              include: { item: true }
            }
          }
        },
        specialization: true
      },
    });

    const char2 = await this.prisma.character.findUnique({
      where: { id: match.player2.characterId },
      include: {
        inventory: {
          include: {
            items: {
              where: { isEquipped: true },
              include: { item: true }
            }
          }
        },
        specialization: true
      },
    });

    if (!char1 || !char2) {
      console.error('[PVP] Character not found!');
      throw new BadRequestException('Character not found');
    }

    const equippedItems1 = char1.inventory?.items || [];
    const equippedItems2 = char2.inventory?.items || [];

    const effectiveArmor1 = StatsCalculator.calculateEffectiveArmor(char1, equippedItems1);
    const playerDamage1 = StatsCalculator.calculatePlayerDamage(char1, equippedItems1);

    const effectiveArmor2 = StatsCalculator.calculateEffectiveArmor(char2, equippedItems2);
    const playerDamage2 = StatsCalculator.calculatePlayerDamage(char2, equippedItems2);

    // Рассчитываем урон
    const p1DamageToP2 = CombatCalculator.calculateDamage(
      match.player1.actions!.attacks,
      match.player2.actions!.defenses,
      playerDamage1,
      effectiveArmor2,
    );

    const p2DamageToP1 = CombatCalculator.calculateDamage(
      match.player2.actions!.attacks,
      match.player1.actions!.defenses,
      playerDamage2,
      effectiveArmor1,
    );

    // Применяем урон
    match.player1.hp = Math.max(0, match.player1.hp - p2DamageToP1);
    match.player2.hp = Math.max(0, match.player2.hp - p1DamageToP2);

    console.log(`[PVP] Damage dealt - P1->P2: ${p1DamageToP2}, P2->P1: ${p2DamageToP1}`);
    console.log(`[PVP] After damage - P1 HP: ${match.player1.hp}, P2 HP: ${match.player2.hp}`);

    const roundResult = {
      roundNumber: match.roundNumber,
      player1: {
        hp: match.player1.hp,
        maxHp: match.player1.maxHp,
        damage: p1DamageToP2,
        actions: match.player1.actions!,
      },
      player2: {
        hp: match.player2.hp,
        maxHp: match.player2.maxHp,
        damage: p2DamageToP1,
        actions: match.player2.actions!,
      },
    };

    // Очищаем действия для следующего раунда
    match.player1.actions = undefined;
    match.player2.actions = undefined;
    match.roundNumber++;

    // Проверяем победителя
    if (match.player1.hp <= 0 || match.player2.hp <= 0) {
      match.status = 'finished';
      match.winner = match.player1.hp > 0 ? match.player1.characterId : match.player2.characterId;

      console.log(`[PVP] Match finished! Winner: ${match.winner}`);

      // Награда победителю
      await this.rewardWinner(match.winner);

      // Удаляем матч
      this.playerMatches.delete(match.player1.characterId);
      this.playerMatches.delete(match.player2.characterId);
      this.matches.delete(match.id);

      return {
        roundResult,
        matchFinished: true,
        winner: match.winner,
      };
    }

    console.log(`[PVP] Round ${match.roundNumber} completed, match continues`);
    return { roundResult };
  }

  // Награда победителю
  private async rewardWinner(characterId: number) {
    const goldReward = Math.floor(Math.random() * 50) + 50; // 50-100 золота

    await this.prisma.character.update({
      where: { id: characterId },
      data: { gold: { increment: goldReward } },
    });
  }

  // Получение количества игроков в очереди
  getQueueCount(): number {
    return this.queue.length;
  }

  // Получение активных матчей
  getActiveMatchesCount(): number {
    return this.matches.size;
  }
}
