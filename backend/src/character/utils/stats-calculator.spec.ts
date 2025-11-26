import { StatsCalculator } from './stats-calculator';
import { Character, InventoryItem, Item } from '@prisma/client';

describe('StatsCalculator', () => {
  const mockCharacter: Character = {
    id: 1,
    userId: 1,
    name: 'Тестовый Воин',
    class: 'warrior',
    level: 5,
    experience: 100,
    freePoints: 0,
    strength: 20,
    agility: 10,
    intelligence: 8,
    armor: 5,
    maxHp: 150,
    currentHp: 150,
    gold: 100,
    stamina: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWeapon: Item = {
    id: 1,
    name: 'Меч',
    type: 'weapon',
    description: 'Простой меч',
    rarity: 'common',
    damage: 15,
    armor: 0,
    bonusStr: 5,
    bonusAgi: 2,
    bonusInt: 0,
    minLevel: 1,
    minStrength: 10,
    minAgility: 0,
    minIntelligence: 0,
    sellPrice: 50,
  };

  const mockArmor: Item = {
    id: 2,
    name: 'Кожаная Броня',
    type: 'armor',
    description: 'Легкая броня',
    rarity: 'common',
    damage: 0,
    armor: 10,
    bonusStr: 2,
    bonusAgi: 1,
    bonusInt: 0,
    minLevel: 1,
    minStrength: 10,
    minAgility: 0,
    minIntelligence: 0,
    sellPrice: 40,
  };

  const mockHelmet: Item = {
    id: 3,
    name: 'Шлем',
    type: 'helmet',
    description: 'Простой шлем',
    rarity: 'common',
    damage: 0,
    armor: 5,
    bonusStr: 1,
    bonusAgi: 0,
    bonusInt: 2,
    minLevel: 1,
    minStrength: 5,
    minAgility: 0,
    minIntelligence: 0,
    sellPrice: 30,
  };

  const createInventoryItem = (
    id: number,
    item: Item,
    isEquipped: boolean,
    enhancement = 0,
  ): InventoryItem & { item: Item } => ({
    id,
    inventoryId: 1,
    itemId: item.id,
    quantity: 1,
    enhancement,
    isEquipped,
    item,
  });

  describe('calculateEffectiveArmor', () => {
    it('должен вернуть базовую броню персонажа без экипировки', () => {
      const result = StatsCalculator.calculateEffectiveArmor(mockCharacter, []);

      expect(result).toBe(5);
    });

    it('должен добавить броню от экипированных предметов', () => {
      const equippedItems = [
        createInventoryItem(1, mockArmor, true),
        createInventoryItem(2, mockHelmet, true),
      ];

      const result = StatsCalculator.calculateEffectiveArmor(mockCharacter, equippedItems);

      expect(result).toBe(20); // 5 (базовая) + 10 (броня) + 5 (шлем)
    });

    it('не должен учитывать не экипированные предметы', () => {
      const equippedItems = [
        createInventoryItem(1, mockArmor, true),
        createInventoryItem(2, mockHelmet, false), // Не экипирован
      ];

      const result = StatsCalculator.calculateEffectiveArmor(mockCharacter, equippedItems);

      expect(result).toBe(15); // 5 (базовая) + 10 (броня)
    });
  });

  describe('calculateEffectiveStrength', () => {
    it('должен вернуть базовую силу персонажа без экипировки', () => {
      const result = StatsCalculator.calculateEffectiveStrength(mockCharacter, []);

      expect(result).toBe(20);
    });

    it('должен добавить бонусы силы от экипированных предметов', () => {
      const equippedItems = [
        createInventoryItem(1, mockWeapon, true), // +5 Str
        createInventoryItem(2, mockArmor, true),  // +2 Str
        createInventoryItem(3, mockHelmet, true), // +1 Str
      ];

      const result = StatsCalculator.calculateEffectiveStrength(mockCharacter, equippedItems);

      expect(result).toBe(28); // 20 + 5 + 2 + 1
    });

    it('не должен учитывать не экипированные предметы', () => {
      const equippedItems = [
        createInventoryItem(1, mockWeapon, true),  // +5 Str
        createInventoryItem(2, mockArmor, false),  // Не экипирована
      ];

      const result = StatsCalculator.calculateEffectiveStrength(mockCharacter, equippedItems);

      expect(result).toBe(25); // 20 + 5
    });
  });

  describe('calculateEffectiveAgility', () => {
    it('должен вернуть базовую ловкость персонажа без экипировки', () => {
      const result = StatsCalculator.calculateEffectiveAgility(mockCharacter, []);

      expect(result).toBe(10);
    });

    it('должен добавить бонусы ловкости от экипированных предметов', () => {
      const equippedItems = [
        createInventoryItem(1, mockWeapon, true), // +2 Agi
        createInventoryItem(2, mockArmor, true),  // +1 Agi
      ];

      const result = StatsCalculator.calculateEffectiveAgility(mockCharacter, equippedItems);

      expect(result).toBe(13); // 10 + 2 + 1
    });

    it('не должен учитывать не экипированные предметы', () => {
      const equippedItems = [
        createInventoryItem(1, mockWeapon, false), // Не экипировано
        createInventoryItem(2, mockArmor, true),   // +1 Agi
      ];

      const result = StatsCalculator.calculateEffectiveAgility(mockCharacter, equippedItems);

      expect(result).toBe(11); // 10 + 1
    });
  });

  describe('calculateEffectiveIntelligence', () => {
    it('должен вернуть базовый интеллект персонажа без экипировки', () => {
      const result = StatsCalculator.calculateEffectiveIntelligence(mockCharacter, []);

      expect(result).toBe(8);
    });

    it('должен добавить бонусы интеллекта от экипированных предметов', () => {
      const equippedItems = [
        createInventoryItem(1, mockHelmet, true), // +2 Int
      ];

      const result = StatsCalculator.calculateEffectiveIntelligence(mockCharacter, equippedItems);

      expect(result).toBe(10); // 8 + 2
    });

    it('не должен учитывать не экипированные предметы', () => {
      const equippedItems = [
        createInventoryItem(1, mockHelmet, false), // Не экипирован
      ];

      const result = StatsCalculator.calculateEffectiveIntelligence(mockCharacter, equippedItems);

      expect(result).toBe(8); // Только базовый
    });
  });

  describe('calculatePlayerDamage', () => {
    it('должен рассчитать урон без экипировки', () => {
      const result = StatsCalculator.calculatePlayerDamage(mockCharacter, []);

      // Формула: Str + floor(Agi/2) = 20 + floor(10/2) = 20 + 5 = 25
      expect(result).toBe(25);
    });

    it('должен добавить урон от оружия и бонусы характеристик', () => {
      const equippedItems = [
        createInventoryItem(1, mockWeapon, true), // +15 damage, +5 Str, +2 Agi
      ];

      const result = StatsCalculator.calculatePlayerDamage(mockCharacter, equippedItems);

      // Эффективная сила: 20 + 5 = 25
      // Эффективная ловкость: 10 + 2 = 12
      // Формула: 25 + floor(12/2) + 15 (урон оружия) = 25 + 6 + 15 = 46
      expect(result).toBe(46);
    });

    it('должен учитывать только экипированное оружие', () => {
      const equippedItems = [
        createInventoryItem(1, mockWeapon, false), // Не экипировано
      ];

      const result = StatsCalculator.calculatePlayerDamage(mockCharacter, equippedItems);

      // Только базовые характеристики
      expect(result).toBe(25);
    });

    it('должен учитывать бонусы от брони без урона', () => {
      const equippedItems = [
        createInventoryItem(1, mockArmor, true), // +2 Str, +1 Agi, но 0 damage
      ];

      const result = StatsCalculator.calculatePlayerDamage(mockCharacter, equippedItems);

      // Эффективная сила: 20 + 2 = 22
      // Эффективная ловкость: 10 + 1 = 11
      // Формула: 22 + floor(11/2) = 22 + 5 = 27
      expect(result).toBe(27);
    });

    it('должен корректно рассчитать урон с полным комплектом экипировки', () => {
      const equippedItems = [
        createInventoryItem(1, mockWeapon, true), // +15 dmg, +5 Str, +2 Agi
        createInventoryItem(2, mockArmor, true),  // +2 Str, +1 Agi
        createInventoryItem(3, mockHelmet, true), // +1 Str
      ];

      const result = StatsCalculator.calculatePlayerDamage(mockCharacter, equippedItems);

      // Эффективная сила: 20 + 5 + 2 + 1 = 28
      // Эффективная ловкость: 10 + 2 + 1 = 13
      // Формула: 28 + floor(13/2) + 15 = 28 + 6 + 15 = 49
      expect(result).toBe(49);
    });
  });

  describe('calculateMaxHP', () => {
    it('должен вернуть максимальное HP персонажа', () => {
      const result = StatsCalculator.calculateMaxHP(mockCharacter);

      expect(result).toBe(150);
    });

    it('должен вернуть корректное значение для разных персонажей', () => {
      const weakCharacter = { ...mockCharacter, maxHp: 80 };
      const strongCharacter = { ...mockCharacter, maxHp: 250 };

      expect(StatsCalculator.calculateMaxHP(weakCharacter)).toBe(80);
      expect(StatsCalculator.calculateMaxHP(strongCharacter)).toBe(250);
    });
  });
});