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

    const lootedItems = (battle.lootedItems as any[]) || [];
    const expGained = battle.expGained || 0;
    const goldGained = battle.goldGained || 0;

    console.log(`📦 getBattleWithLoot для боя ${battleId}:`, {
      lootedItemsCount: lootedItems.length,
      lootedItems,
      expGained,
      goldGained,
    });

    return {
      lootedItems,
      expGained,
      goldGained,
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

    let monsterActions = MonsterAI.generateActions();
    
    // ДОПОЛНИТЕЛЬНАЯ ЗАЩИТА: Фильтруем 'back' и дубликаты на всякий случай
    // (на случай если где-то используется старая версия кода)
    const validZones: Zone[] = ['head', 'body', 'legs', 'arms'];
    
    // Функция для получения уникальных зон без дубликатов
    // ГАРАНТИРУЕТ отсутствие дубликатов
    const getUniqueZones = (zones: Zone[], count: number): Zone[] => {
      console.log('🔍 getUniqueZones вызвана:', { input: zones, count });
      
      // ШАГ 1: ЖЕСТКО убираем 'back' и фильтруем только валидные зоны
      // 'back' НЕ ДОЛЖЕН существовать для мобов НИКОГДА
      const filtered = zones.filter(zone => {
        if (zone === 'back') {
          console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Обнаружен "back" в getUniqueZones!', zones);
          return false; // Жестко исключаем 'back'
        }
        return validZones.includes(zone);
      });
      console.log('🔍 После фильтрации:', filtered);
      
      // ШАГ 2: Убираем дубликаты используя Set (гарантирует уникальность)
      const uniqueSet = new Set(filtered);
      const unique = Array.from(uniqueSet);
      console.log('🔍 После удаления дубликатов:', unique);
      
      // ШАГ 3: Если уникальных зон недостаточно, добавляем недостающие из валидных
      const availableZones = [...validZones]; // Копируем массив
      
      // Перемешиваем доступные зоны для случайности (Fisher-Yates)
      for (let i = availableZones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableZones[i], availableZones[j]] = [availableZones[j], availableZones[i]];
      }
      
      // Добавляем недостающие уникальные зоны (проверяем через Set для гарантии)
      const usedSet = new Set(unique);
      for (const zone of availableZones) {
        if (unique.length >= count) break;
        if (!usedSet.has(zone)) {
          unique.push(zone);
          usedSet.add(zone); // Добавляем в Set для проверки
        }
      }
      console.log('🔍 После добавления недостающих:', unique);
      
      // ШАГ 4: Возвращаем ровно count зон
      const result = unique.slice(0, count);
      
      // ШАГ 5: ФИНАЛЬНАЯ СТРОГАЯ проверка: убеждаемся, что нет дубликатов
      const resultSet = new Set(result);
      if (resultSet.size !== result.length) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА в getUniqueZones: обнаружены дубликаты!', {
          input: zones,
          result,
          uniqueCount: resultSet.size,
          actualCount: result.length,
          expected: count
        });
        // Если все же есть дубликаты, пересоздаем массив ТОЛЬКО из уникальных значений
        const fixed = Array.from(resultSet);
        // Добавляем недостающие зоны (гарантируя уникальность через Set)
        const fixedSet = new Set(fixed);
        for (const zone of availableZones) {
          if (fixed.length >= count) break;
          if (!fixedSet.has(zone)) {
            fixed.push(zone);
            fixedSet.add(zone);
          }
        }
        const final = fixed.slice(0, count);
        console.log('🔧 Исправленный результат:', final);
        return final;
      }
      
      // ШАГ 6: Проверяем, что результат имеет правильную длину
      if (result.length !== count) {
        console.error('❌ ОШИБКА: Неправильное количество зон!', {
          expected: count,
          actual: result.length,
          result
        });
        throw new Error(`Не удалось получить ${count} уникальных зон. Получено: ${result.length}`);
      }
      
      console.log('✅ getUniqueZones успешно вернула:', result);
      return result;
    };
    
    // Получаем уникальные атаки (ровно 2)
    console.log('🎯 Начинаем обработку действий моба:', {
      originalAttacks: monsterActions.attacks,
      originalDefenses: monsterActions.defenses
    });
    
    const uniqueAttacks = getUniqueZones(monsterActions.attacks, 2);
    const uniqueDefenses = getUniqueZones(monsterActions.defenses, 3);
    
    // ДОПОЛНИТЕЛЬНАЯ проверка перед созданием объекта
    const attacksSet = new Set(uniqueAttacks);
    const defensesSet = new Set(uniqueDefenses);
    
    if (attacksSet.size !== uniqueAttacks.length) {
      console.error('❌ ДУБЛИКАТЫ В АТАКАХ после getUniqueZones!', uniqueAttacks);
      // Исправляем вручную
      const fixedAttacks: Zone[] = [];
      const fixedAttacksSet = new Set<Zone>();
      for (const zone of uniqueAttacks) {
        if (!fixedAttacksSet.has(zone) && validZones.includes(zone)) {
          fixedAttacks.push(zone);
          fixedAttacksSet.add(zone);
        }
      }
      // Добавляем недостающие
      for (const zone of validZones) {
        if (fixedAttacks.length >= 2) break;
        if (!fixedAttacksSet.has(zone)) {
          fixedAttacks.push(zone);
          fixedAttacksSet.add(zone);
        }
      }
      uniqueAttacks.splice(0, uniqueAttacks.length, ...fixedAttacks.slice(0, 2));
    }
    
    if (defensesSet.size !== uniqueDefenses.length) {
      console.error('❌ ДУБЛИКАТЫ В ЗАЩИТАХ после getUniqueZones!', uniqueDefenses);
      // Исправляем вручную
      const fixedDefenses: Zone[] = [];
      const fixedDefensesSet = new Set<Zone>();
      for (const zone of uniqueDefenses) {
        if (!fixedDefensesSet.has(zone) && validZones.includes(zone)) {
          fixedDefenses.push(zone);
          fixedDefensesSet.add(zone);
        }
      }
      // Добавляем недостающие
      for (const zone of validZones) {
        if (fixedDefenses.length >= 3) break;
        if (!fixedDefensesSet.has(zone)) {
          fixedDefenses.push(zone);
          fixedDefensesSet.add(zone);
        }
      }
      uniqueDefenses.splice(0, uniqueDefenses.length, ...fixedDefenses.slice(0, 3));
    }
    
    // Пересоздаем monsterActions с гарантированно правильными данными
    monsterActions = {
      attacks: [uniqueAttacks[0], uniqueAttacks[1]] as [Zone, Zone],
      defenses: [uniqueDefenses[0], uniqueDefenses[1], uniqueDefenses[2]] as [Zone, Zone, Zone],
    };
    
    // СТРОГАЯ финальная проверка и логирование
    if (monsterActions.attacks.includes('back') || monsterActions.defenses.includes('back')) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: После фильтрации все еще есть "back"!', monsterActions);
      throw new Error('Моб не может выбирать зону "back"');
    }
    
    const attackSet = new Set(monsterActions.attacks);
    const defenseSet = new Set(monsterActions.defenses);
    
    if (attackSet.size !== 2) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Дубликаты в атаках после фильтрации!', {
        attacks: monsterActions.attacks,
        uniqueCount: attackSet.size,
        expected: 2
      });
      throw new Error(`Обнаружены дубликаты в атаках моба: ${monsterActions.attacks.join(', ')}`);
    }
    
    if (defenseSet.size !== 3) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Дубликаты в защитах после фильтрации!', {
        defenses: monsterActions.defenses,
        uniqueCount: defenseSet.size,
        expected: 3
      });
      throw new Error(`Обнаружены дубликаты в защитах моба: ${monsterActions.defenses.join(', ')}`);
    }
    
    console.log('✅ Моб действия после фильтрации (гарантированно уникальные):', {
      attacks: monsterActions.attacks,
      defenses: monsterActions.defenses,
      attackUnique: attackSet.size === 2,
      defenseUnique: defenseSet.size === 3
    });

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

    // Вычисляем turnNumber для текущего моба
    // Фильтруем раунды по текущему мобу и считаем количество ходов
    const currentMonsterRounds = currentRounds.filter(r => r.roundNumber === fullBattle.currentMonster);
    const turnNumber = currentMonsterRounds.length + 1;

    // ФИНАЛЬНАЯ КРИТИЧЕСКАЯ ПРОВЕРКА перед сохранением в базу данных
    // Убеждаемся, что 'back' НИКОГДА не попадет в результат
    if (monsterActions.attacks.some(z => z === 'back') || monsterActions.defenses.some(z => z === 'back')) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: "back" обнаружен перед сохранением в БД!', {
        monsterActions,
        attacks: monsterActions.attacks,
        defenses: monsterActions.defenses
      });
      // Принудительно исправляем
      monsterActions = {
        attacks: monsterActions.attacks.filter(z => z !== 'back').slice(0, 2) as [Zone, Zone],
        defenses: monsterActions.defenses.filter(z => z !== 'back').slice(0, 3) as [Zone, Zone, Zone],
      };
      // Если после фильтрации недостаточно зон, добавляем недостающие
      const validZonesForFix: Zone[] = ['head', 'body', 'legs', 'arms'];
      while (monsterActions.attacks.length < 2) {
        const available = validZonesForFix.find(z => !monsterActions.attacks.includes(z));
        if (available) monsterActions.attacks.push(available);
        else break;
      }
      while (monsterActions.defenses.length < 3) {
        const available = validZonesForFix.find(z => !monsterActions.defenses.includes(z));
        if (available) monsterActions.defenses.push(available);
        else break;
      }
      console.log('🔧 Исправленные действия моба:', monsterActions);
    }

    const roundResult: RoundResult = {
      roundNumber: fullBattle.currentMonster,  // Номер раунда = номер текущего моба (1-5)
      turnNumber,  // Номер хода внутри раунда с текущим мобом
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
    let finalCharacterHp = newCharacterHp;
    let battleLoot: any[] = [];
    let battleExpGained = 0;
    let battleGoldGained = 0;

    if (newCharacterHp <= 0) {
      newStatus = 'lost';

      // Начисляем награды за пройденных мобов при поражении
      const defeatedMonsters = fullBattle.currentMonster - 1 + (newMonsterHp <= 0 ? 1 : 0);
      if (defeatedMonsters > 0) {
        // Награда = (общая награда / количество мобов) * количество побежденных мобов
        const goldReward = Math.floor((dungeon.goldReward / dungeon.monsters.length) * defeatedMonsters);
        const expReward = Math.floor((dungeon.expReward / dungeon.monsters.length) * defeatedMonsters);

        battleGoldGained = goldReward;
        battleExpGained = expReward;

        await this.prisma.character.update({
          where: { id: character.id },
          data: {
            gold: character.gold + goldReward,
            experience: character.experience + expReward,
          },
        });

        // Автоматическая проверка повышения уровня
        await this.levelUpService.checkAndLevelUp(character.id);

        // Генерируем лут со всех побежденных монстров при поражении
        // Побежденные монстры: все монстры до текущего (currentMonster - 1), плюс текущий, если он был убит
        const monstersToLoot: number[] = [];
        
        // Добавляем всех побежденных монстров до текущего
        for (let i = 0; i < fullBattle.currentMonster - 1; i++) {
          monstersToLoot.push(dungeon.monsters[i].monster.id);
        }
        
        // Если текущий монстр был убит, добавляем его тоже
        if (newMonsterHp <= 0) {
          monstersToLoot.push(currentMonster.id);
        }

        console.log(`💀 ПОРАЖЕНИЕ: Генерируем лут с ${monstersToLoot.length} монстров`);
        
        // Генерируем лут с каждого побежденного монстра
        const allLootDetails: string[] = [];
        for (const monsterId of monstersToLoot) {
          const lootedItems = await this.lootService.generateLoot(monsterId);
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
                allLootDetails.push(`${item.name} x${loot.quantity}`);
              }
            }
          }
        }
        
        if (allLootDetails.length > 0) {
          console.log(`🎁 ДРОП при поражении: ${allLootDetails.join(', ')}`);
        } else {
          console.log(`❌ ДРОП при поражении: ничего не выпало`);
        }
      }
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

      // Генерируем лут со всех побежденных монстров при победе
      // Все монстры до текущего (currentMonster - 1), плюс текущий (босс)
      const monstersToLoot: number[] = [];
      
      // Добавляем всех побежденных монстров до текущего
      for (let i = 0; i < fullBattle.currentMonster - 1; i++) {
        monstersToLoot.push(dungeon.monsters[i].monster.id);
      }
      
      // Добавляем текущего монстра (босса), так как он был побежден
      monstersToLoot.push(currentMonster.id);

      console.log(`🏆 ПОБЕДА в подземелье: Генерируем лут с ${monstersToLoot.length} монстров`);
      
      // Генерируем лут с каждого побежденного монстра
      const allLootDetails: string[] = [];
      for (const monsterId of monstersToLoot) {
        const lootedItems = await this.lootService.generateLoot(monsterId);
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
              allLootDetails.push(`${item.name} x${loot.quantity}`);
            }
          }
        }
      }
      
      if (allLootDetails.length > 0) {
        console.log(`🎁 ДРОП при победе: ${allLootDetails.join(', ')}`);
      } else {
        console.log(`❌ ДРОП при победе: ничего не выпало`);
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

      console.log(`✅ Победа над промежуточным монстром "${currentMonster.name}" (ID: ${currentMonster.id})`);
      
      const lootedItems = await this.lootService.generateLoot(currentMonster.id);
      if (lootedItems.length > 0) {
        await this.lootService.addItemsToInventory(character.id, lootedItems);
        
        // Получаем информацию о предметах для логирования
        const lootDetails: string[] = [];
        for (const loot of lootedItems) {
          const item = await this.prisma.item.findUnique({
            where: { id: loot.itemId },
          });
          if (item) {
            lootDetails.push(`${item.name} x${loot.quantity}`);
          }
        }
        console.log(`🎁 ДРОП с промежуточного монстра: ${lootDetails.join(', ')}`);
      } else {
        console.log(`❌ ДРОП с промежуточного монстра: ничего не выпало`);
      }

      const healAmount = Math.floor(character.maxHp * 0.3);
      finalCharacterHp = Math.min(character.maxHp, newCharacterHp + healAmount);
    }

    const updatedRounds = [...currentRounds, roundResult];

    // Логируем данные перед сохранением
    if (newStatus === 'won' || newStatus === 'lost') {
      console.log(`💾 Сохранение данных боя ${battleId}:`, {
        status: newStatus,
        lootedItemsCount: battleLoot.length,
        lootedItems: battleLoot,
        expGained: battleExpGained,
        goldGained: battleGoldGained,
      });
    }

    await this.prisma.pveBattle.update({
      where: { id: battleId },
      data: {
        characterHp: finalCharacterHp,
        monsterHp: nextMonsterHp,
        currentMonster: nextMonster,
        status: newStatus,
        playerFirst: nextPlayerFirst,
        rounds: JSON.parse(JSON.stringify(updatedRounds)),
        ...((newStatus === 'won' || newStatus === 'lost') && {
          lootedItems: JSON.parse(JSON.stringify(battleLoot)), // Убеждаемся, что это чистый JSON
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