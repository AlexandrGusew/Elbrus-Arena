import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Zone, RoundActions, RoundResult, Battle } from '../../../shared/types/battle.types';
import { StatsCalculator } from '../character/utils/stats-calculator';
import { CombatCalculator } from './utils/combat-calculator';
import { MonsterAI } from './utils/monster-ai';

export type { Zone, RoundActions, RoundResult, Battle };

@Injectable()
export class BattleService {
  constructor(private prisma: PrismaService) {}

  async startBattle(characterId: number, dungeonId: number): Promise<Battle> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const dungeon = await this.prisma.dungeon.findUnique({
      where: { id: dungeonId },
      include: {
        monsters: {
          include: { monster: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!dungeon || dungeon.monsters.length === 0) {
      throw new NotFoundException('Dungeon not found or has no monsters');
    }

    const firstMonster = dungeon.monsters[0].monster;

    const battle = await this.prisma.pveBattle.create({
      data: {
        characterId,
        dungeonId,
        currentMonster: 1,
        characterHp: character.currentHp,
        monsterHp: firstMonster.hp,
        status: 'active',
        rounds: [],
      },
    });

    return {
      id: battle.id,
      characterId: battle.characterId,
      dungeonId: battle.dungeonId,
      currentMonster: battle.currentMonster,
      totalMonsters: dungeon.monsters.length,
      characterHp: battle.characterHp,
      monsterHp: battle.monsterHp,
      status: battle.status as 'active' | 'won' | 'lost',
      rounds: [],
    };
  }

  async getBattle(battleId: string): Promise<Battle | null> {
    const battle = await this.prisma.pveBattle.findUnique({
      where: { id: battleId },
      include: {
        dungeon: {
          include: {
            monsters: true,
          },
        },
      },
    });

    if (!battle) {
      return null;
    }

    return {
      id: battle.id,
      characterId: battle.characterId,
      dungeonId: battle.dungeonId,
      currentMonster: battle.currentMonster,
      totalMonsters: battle.dungeon.monsters.length,
      characterHp: battle.characterHp,
      monsterHp: battle.monsterHp,
      status: battle.status as 'active' | 'won' | 'lost',
      rounds: Array.isArray(battle.rounds) ? (battle.rounds as unknown as RoundResult[]) : [],
    };
  }

  async processRound(
    battleId: string,
    playerActions: RoundActions,
  ): Promise<RoundResult> {
    const battle = await this.getBattle(battleId);
    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    if (battle.status !== 'active') {
      throw new BadRequestException('Battle is not active');
    }

    const monsterActions = MonsterAI.generateActions();

    const character = await this.prisma.character.findUnique({
      where: { id: battle.characterId },
      include: {
        inventory: {
          include: {
            items: {
              where: { isEquipped: true },
              include: { item: true },
            },
          },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const equippedItems = character.inventory?.items || [];

    const dungeon = await this.prisma.dungeon.findUnique({
      where: { id: battle.dungeonId },
      include: {
        monsters: {
          include: { monster: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!dungeon || !dungeon.monsters || dungeon.monsters.length === 0) {
      throw new Error('Dungeon not found or has no monsters');
    }

    const currentMonster =
      dungeon.monsters[battle.currentMonster - 1].monster;

    const effectiveArmor = StatsCalculator.calculateEffectiveArmor(character, equippedItems);
    const playerBaseDamage = StatsCalculator.calculatePlayerDamage(character, equippedItems);

    const playerDamage = CombatCalculator.calculateDamage(
      monsterActions.attacks,
      playerActions.defenses,
      currentMonster.damage,
      effectiveArmor,
    );

    const monsterDamage = CombatCalculator.calculateDamage(
      playerActions.attacks,
      monsterActions.defenses,
      playerBaseDamage,
      currentMonster.armor,
    );

    const newCharacterHp = Math.max(0, battle.characterHp - playerDamage);
    const newMonsterHp = Math.max(0, battle.monsterHp - monsterDamage);

    const roundResult: RoundResult = {
      roundNumber: battle.rounds.length + 1,
      playerActions,
      monsterActions,
      playerDamage,
      monsterDamage,
      playerHp: newCharacterHp,
      monsterHp: newMonsterHp,
    };

    let newStatus: 'active' | 'won' | 'lost' = 'active';
    let nextMonster = battle.currentMonster;
    let nextMonsterHp = newMonsterHp;

    if (newCharacterHp <= 0) {
      newStatus = 'lost';
    } else if (newMonsterHp <= 0) {
      if (battle.currentMonster < dungeon.monsters.length) {
        nextMonster = battle.currentMonster + 1;
        const nextMonsterData = dungeon.monsters[nextMonster - 1].monster;
        nextMonsterHp = nextMonsterData.hp;
        newStatus = 'active';
      } else {
        newStatus = 'won';
      }
    }

    let finalCharacterHp = newCharacterHp;

    if (newStatus === 'won') {
      finalCharacterHp = character.maxHp;

      const goldPerMonster = 10;
      const expPerMonster = 25;
      const totalGold = dungeon.monsters.length * goldPerMonster;
      const totalExp = dungeon.monsters.length * expPerMonster;

      await this.prisma.character.update({
        where: { id: character.id },
        data: {
          currentHp: character.maxHp,
          gold: character.gold + totalGold,
          experience: character.experience + totalExp,
        },
      });
    } else if (newMonsterHp <= 0 && newStatus === 'active') {
      const goldReward = 10;
      const expReward = 25;

      await this.prisma.character.update({
        where: { id: character.id },
        data: {
          gold: character.gold + goldReward,
          experience: character.experience + expReward,
        },
      });

      const healAmount = Math.floor(character.maxHp * 0.3);
      finalCharacterHp = Math.min(character.maxHp, newCharacterHp + healAmount);
    }

    const updatedRounds = [...battle.rounds, roundResult];

    await this.prisma.pveBattle.update({
      where: { id: battleId },
      data: {
        characterHp: finalCharacterHp,
        monsterHp: nextMonsterHp,
        currentMonster: nextMonster,
        status: newStatus,
        rounds: JSON.parse(JSON.stringify(updatedRounds)),
      },
    });

    return roundResult;
  }

}