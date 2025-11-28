import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Zone, RoundActions, RoundResult, Battle } from '../../../shared/types/battle.types';
import { StatsCalculator } from '../character/utils/stats-calculator';
import { CombatCalculator } from './utils/combat-calculator';
import { MonsterAI } from './utils/monster-ai';
import { LootService } from '../loot/loot.service';
import { CharacterLevelUpService } from '../character/character-levelup.service';
import { CharacterStaminaService } from '../character/character-stamina.service';

export type { Zone, RoundActions, RoundResult, Battle };

@Injectable()
export class BattleService {
  constructor(
    private prisma: PrismaService,
    private lootService: LootService,
    private levelUpService: CharacterLevelUpService,
    private staminaService: CharacterStaminaService,
  ) {}

  async startBattle(characterId: number, dungeonId: number): Promise<Battle> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { specialization: true },
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

    // Проверяем и тратим стамину
    await this.staminaService.spendStamina(characterId, dungeon.staminaCost);

    const firstMonster = dungeon.monsters[0].monster;

    const playerFirst = Math.random() < 0.5;

    const battle = await this.prisma.pveBattle.create({
      data: {
        characterId,
        dungeonId,
        currentMonster: 1,
        characterHp: character.currentHp,
        monsterHp: firstMonster.hp,
        status: 'active',
        rounds: [],
        playerFirst,
      },
    });

    // Загружаем доступные способности персонажа
    const availableAbilities = await this.loadCharacterAbilities(character);

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
      availableAbilities,
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

  async getBattleWithLoot(battleId: string) {
    const battle = await this.prisma.pveBattle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return null;
    }

    return {
      lootedItems: battle.lootedItems as any[] || [],
      expGained: battle.expGained || 0,
      goldGained: battle.goldGained || 0,
    };
  }

  async processRound(
    battleId: string,
    playerActions: RoundActions,
  ): Promise<RoundResult> {
    const fullBattle = await this.prisma.pveBattle.findUnique({
      where: { id: battleId },
      include: {
        character: {
          include: {
            specialization: true,
            inventory: {
              include: {
                items: {
                  where: { isEquipped: true },
                  include: { item: true },
                },
              },
            },
          },
        },
        dungeon: {
          include: {
            monsters: {
              include: { monster: true },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!fullBattle) {
      throw new NotFoundException('Battle not found');
    }

    if (fullBattle.status !== 'active') {
      throw new BadRequestException('Battle is not active');
    }

    const character = fullBattle.character;
    const dungeon = fullBattle.dungeon;

    if (!dungeon || !dungeon.monsters || dungeon.monsters.length === 0) {
      throw new Error('Dungeon not found or has no monsters');
    }

    // Проверка: зона 'back' доступна только для SHADOW_DANCER
    const isShadowDancer = character.specialization?.branch === 'SHADOW_DANCER';
    const allPlayerZones = [...playerActions.attacks, ...playerActions.defenses];

    if (!isShadowDancer && allPlayerZones.includes('back')) {
      throw new BadRequestException('Зона "спина" доступна только для Shadow Dancer');
    }

    const currentMonster =
      dungeon.monsters[fullBattle.currentMonster - 1].monster;

    const equippedItems = character.inventory?.items || [];

    const monsterActions = MonsterAI.generateActions();

    const effectiveArmor = StatsCalculator.calculateEffectiveArmor(character, equippedItems);
    const playerBaseDamage = StatsCalculator.calculatePlayerDamage(character, equippedItems);

    const playerFirst = fullBattle.playerFirst ?? true;

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

    let newCharacterHp = fullBattle.characterHp;
    let newMonsterHp = fullBattle.monsterHp;
    let newStatus: 'active' | 'won' | 'lost' = 'active';

    if (playerFirst) {
      newMonsterHp = Math.max(0, fullBattle.monsterHp - monsterDamage);

      if (newMonsterHp > 0) {
        newCharacterHp = Math.max(0, fullBattle.characterHp - playerDamage);
      }
    } else {
      newCharacterHp = Math.max(0, fullBattle.characterHp - playerDamage);

      if (newCharacterHp > 0) {
        newMonsterHp = Math.max(0, fullBattle.monsterHp - monsterDamage);
      }
    }

    const currentRounds = Array.isArray(fullBattle.rounds) ? (fullBattle.rounds as unknown as RoundResult[]) : [];

    const roundResult: RoundResult = {
      roundNumber: currentRounds.length + 1,
      playerActions,
      monsterActions,
      playerDamage,
      monsterDamage,
      playerHp: newCharacterHp,
      monsterHp: newMonsterHp,
    };

    let nextMonster = fullBattle.currentMonster;
    let nextMonsterHp = newMonsterHp;
    let nextPlayerFirst = !playerFirst;

    if (newCharacterHp <= 0) {
      newStatus = 'lost';
    } else if (newMonsterHp <= 0) {
      if (fullBattle.currentMonster < dungeon.monsters.length) {
        nextMonster = fullBattle.currentMonster + 1;
        const nextMonsterData = dungeon.monsters[nextMonster - 1].monster;
        nextMonsterHp = nextMonsterData.hp;
        nextPlayerFirst = Math.random() < 0.5;
        newStatus = 'active';
      } else {
        newStatus = 'won';
      }
    }

    let finalCharacterHp = newCharacterHp;
    let battleLoot: any[] = [];
    let battleExpGained = 0;
    let battleGoldGained = 0;

    if (newStatus === 'won') {
      finalCharacterHp = character.maxHp;

      // Используем награды из настроек подземелья в БД
      const totalGold = dungeon.goldReward;
      const totalExp = dungeon.expReward;

      battleGoldGained = totalGold;
      battleExpGained = totalExp;

      await this.prisma.character.update({
        where: { id: character.id },
        data: {
          currentHp: character.maxHp,
          gold: character.gold + totalGold,
          experience: character.experience + totalExp,
        },
      });

      // Автоматическая проверка повышения уровня
      await this.levelUpService.checkAndLevelUp(character.id);

      const lootedItems = await this.lootService.generateLoot(currentMonster.id);
      if (lootedItems.length > 0) {
        await this.lootService.addItemsToInventory(character.id, lootedItems);

        // Получаем полную информацию о лутнутых предметах
        for (const loot of lootedItems) {
          const item = await this.prisma.item.findUnique({
            where: { id: loot.itemId },
          });
          if (item) {
            battleLoot.push({
              itemId: item.id,
              itemName: item.name,
              itemType: item.type,
              enhancement: 0,
            });
          }
        }
      }
    } else if (newMonsterHp <= 0 && newStatus === 'active') {
      // Награда за промежуточного монстра = общая награда / количество монстров
      const goldReward = Math.floor(dungeon.goldReward / dungeon.monsters.length);
      const expReward = Math.floor(dungeon.expReward / dungeon.monsters.length);

      await this.prisma.character.update({
        where: { id: character.id },
        data: {
          gold: character.gold + goldReward,
          experience: character.experience + expReward,
        },
      });

      // Автоматическая проверка повышения уровня
      await this.levelUpService.checkAndLevelUp(character.id);

      const lootedItems = await this.lootService.generateLoot(currentMonster.id);
      if (lootedItems.length > 0) {
        await this.lootService.addItemsToInventory(character.id, lootedItems);
      }

      const healAmount = Math.floor(character.maxHp * 0.3);
      finalCharacterHp = Math.min(character.maxHp, newCharacterHp + healAmount);
    }

    const updatedRounds = [...currentRounds, roundResult];

    await this.prisma.pveBattle.update({
      where: { id: battleId },
      data: {
        characterHp: finalCharacterHp,
        monsterHp: nextMonsterHp,
        currentMonster: nextMonster,
        status: newStatus,
        playerFirst: nextPlayerFirst,
        rounds: JSON.parse(JSON.stringify(updatedRounds)),
        ...(newStatus === 'won' && {
          lootedItems: battleLoot,
          expGained: battleExpGained,
          goldGained: battleGoldGained,
        }),
      },
    });

    return roundResult;
  }

  /**
   * Загружает доступные способности персонажа
   */
  private async loadCharacterAbilities(character: any): Promise<any[]> {
    // Если нет специализации, возвращаем пустой массив
    if (!character.specialization) {
      return [];
    }

    const spec = character.specialization;

    // Определяем какие тиры разблокированы
    const unlockedTiers: number[] = [];
    if (spec.tier1Unlocked) unlockedTiers.push(1);
    if (spec.tier2Unlocked) unlockedTiers.push(2);
    if (spec.tier3Unlocked) unlockedTiers.push(3);

    // Загружаем способности для разблокированных тиров
    const abilities = await this.prisma.specializationAbility.findMany({
      where: {
        branch: spec.branch,
        tier: { in: unlockedTiers },
      },
      orderBy: { tier: 'asc' },
    });

    // Преобразуем в формат BattleAbility с currentCooldown = 0 (доступны сразу)
    return abilities.map((ability) => ({
      id: ability.id,
      name: ability.name,
      description: ability.description,
      cooldown: ability.cooldown,
      currentCooldown: 0,  // В начале боя все способности доступны
      effects: ability.effects,
    }));
  }

}