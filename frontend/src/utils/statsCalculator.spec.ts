import { describe, it, expect } from 'vitest';
import { StatsCalculator } from './statsCalculator';
import type { Character } from '../types/api';

describe('StatsCalculator', () => {
  const mockCharacter: Character = {
    id: 1,
    userId: 1,
    name: 'TestWarrior',
    class: 'Warrior',
    level: 1,
    experience: 0,
    strength: 10,
    agility: 8,
    intelligence: 5,
    freePoints: 0,
    maxHp: 100,
    currentHp: 100,
    armor: 10,
    gold: 100,
    stamina: 100,
    lastStaminaUpdate: new Date().toISOString(),
    rating: 0,
    createdAt: new Date().toISOString(),
    inventory: {
      id: 1,
      characterId: 1,
      size: 20,
      createdAt: new Date().toISOString(),
      items: [],
    },
  };

  describe('calculateEffectiveStats', () => {
    it('должен правильно рассчитывать базовые статы без экипировки', () => {
      const stats = StatsCalculator.calculateEffectiveStats(mockCharacter);

      expect(stats.strength).toBe(10);
      expect(stats.agility).toBe(8);
      expect(stats.intelligence).toBe(5);
      expect(stats.armor).toBe(10);
      expect(stats.maxHp).toBe(100);
      expect(stats.currentHp).toBe(100);
    });

    it('должен правильно рассчитывать урон: strength + agility/2', () => {
      const stats = StatsCalculator.calculateEffectiveStats(mockCharacter);
      const expectedDamage = 10 + Math.floor(8 / 2);
      expect(stats.damage).toBe(expectedDamage);
    });

    it('должен добавлять бонусы от экипированной брони', () => {
      const characterWithArmor: Character = {
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [
            {
              id: 1,
              inventoryId: 1,
              itemId: 1,
              quantity: 1,
              enhancement: 0,
              isEquipped: true,
              item: {
                id: 1,
                name: 'Iron Armor',
                type: 'armor',
                description: 'Basic armor',
                damage: 0,
                armor: 20,
                bonusStr: 2,
                bonusAgi: 0,
                bonusInt: 0,
                price: 100,
                minStrength: 5,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
          ],
        },
      };

      const stats = StatsCalculator.calculateEffectiveStats(characterWithArmor);

      expect(stats.armor).toBe(30);
      expect(stats.strength).toBe(12);
    });

    it('должен добавлять урон от экипированного оружия', () => {
      const characterWithWeapon: Character = {
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [
            {
              id: 1,
              inventoryId: 1,
              itemId: 1,
              quantity: 1,
              enhancement: 0,
              isEquipped: true,
              item: {
                id: 1,
                name: 'Iron Sword',
                type: 'weapon',
                description: 'Basic sword',
                damage: 15,
                armor: 0,
                bonusStr: 3,
                bonusAgi: 1,
                bonusInt: 0,
                price: 100,
                minStrength: 5,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
          ],
        },
      };

      const stats = StatsCalculator.calculateEffectiveStats(characterWithWeapon);

      const baseDamage = 13 + Math.floor(9 / 2);
      const totalDamage = baseDamage + 15;

      expect(stats.strength).toBe(13);
      expect(stats.agility).toBe(9);
      expect(stats.damage).toBe(totalDamage);
    });

    it('должен применять бонус от заточки +1 (10%)', () => {
      const characterWithEnhancedWeapon: Character = {
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [
            {
              id: 1,
              inventoryId: 1,
              itemId: 1,
              quantity: 1,
              enhancement: 1,
              isEquipped: true,
              item: {
                id: 1,
                name: 'Iron Sword +1',
                type: 'weapon',
                description: 'Enhanced sword',
                damage: 10,
                armor: 0,
                bonusStr: 0,
                bonusAgi: 0,
                bonusInt: 0,
                price: 100,
                minStrength: 5,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
          ],
        },
      };

      const stats = StatsCalculator.calculateEffectiveStats(characterWithEnhancedWeapon);

      const enhancedDamage = Math.floor(10 * (1 + 1 * 0.1));
      expect(stats.damage).toBe(10 + Math.floor(8 / 2) + enhancedDamage);
    });

    it('должен применять бонус от заточки +3 (30%)', () => {
      const characterWithEnhancedArmor: Character = {
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [
            {
              id: 1,
              inventoryId: 1,
              itemId: 1,
              quantity: 1,
              enhancement: 3,
              isEquipped: true,
              item: {
                id: 1,
                name: 'Iron Armor +3',
                type: 'armor',
                description: 'Enhanced armor',
                damage: 0,
                armor: 20,
                bonusStr: 0,
                bonusAgi: 0,
                bonusInt: 0,
                price: 100,
                minStrength: 5,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
          ],
        },
      };

      const stats = StatsCalculator.calculateEffectiveStats(characterWithEnhancedArmor);

      const enhancedArmor = Math.floor(20 * (1 + 3 * 0.1));
      expect(stats.armor).toBe(10 + enhancedArmor);
    });

    it('должен игнорировать неэкипированные предметы', () => {
      const characterWithUnequippedItem: Character = {
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [
            {
              id: 1,
              inventoryId: 1,
              itemId: 1,
              quantity: 1,
              enhancement: 0,
              isEquipped: false,
              item: {
                id: 1,
                name: 'Iron Sword',
                type: 'weapon',
                description: 'Unequipped sword',
                damage: 100,
                armor: 0,
                bonusStr: 50,
                bonusAgi: 0,
                bonusInt: 0,
                price: 100,
                minStrength: 5,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
          ],
        },
      };

      const stats = StatsCalculator.calculateEffectiveStats(characterWithUnequippedItem);

      expect(stats.strength).toBe(10);
      expect(stats.damage).toBe(10 + Math.floor(8 / 2));
    });

    it('должен правильно суммировать бонусы от нескольких предметов', () => {
      const characterWithMultipleItems: Character = {
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [
            {
              id: 1,
              inventoryId: 1,
              itemId: 1,
              quantity: 1,
              enhancement: 0,
              isEquipped: true,
              item: {
                id: 1,
                name: 'Helmet',
                type: 'helmet',
                description: 'Iron helmet',
                damage: 0,
                armor: 5,
                bonusStr: 1,
                bonusAgi: 0,
                bonusInt: 2,
                price: 50,
                minStrength: 0,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
            {
              id: 2,
              inventoryId: 1,
              itemId: 2,
              quantity: 1,
              enhancement: 0,
              isEquipped: true,
              item: {
                id: 2,
                name: 'Boots',
                type: 'legs',
                description: 'Iron boots',
                damage: 0,
                armor: 3,
                bonusStr: 0,
                bonusAgi: 3,
                bonusInt: 0,
                price: 50,
                minStrength: 0,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
          ],
        },
      };

      const stats = StatsCalculator.calculateEffectiveStats(characterWithMultipleItems);

      expect(stats.armor).toBe(10 + 5 + 3);
      expect(stats.strength).toBe(10 + 1);
      expect(stats.agility).toBe(8 + 3);
      expect(stats.intelligence).toBe(5 + 2);
    });
  });

  describe('calculateStatsWithBonus', () => {
    it('должен добавлять временные бонусы к силе', () => {
      const stats = StatsCalculator.calculateStatsWithBonus(mockCharacter, 5, 0, 0);

      expect(stats.strength).toBe(15);
      expect(stats.agility).toBe(8);
      expect(stats.intelligence).toBe(5);
    });

    it('должен добавлять временные бонусы к ловкости', () => {
      const stats = StatsCalculator.calculateStatsWithBonus(mockCharacter, 0, 4, 0);

      expect(stats.strength).toBe(10);
      expect(stats.agility).toBe(12);
      expect(stats.intelligence).toBe(5);
    });

    it('должен добавлять временные бонусы к интеллекту', () => {
      const stats = StatsCalculator.calculateStatsWithBonus(mockCharacter, 0, 0, 3);

      expect(stats.strength).toBe(10);
      expect(stats.agility).toBe(8);
      expect(stats.intelligence).toBe(8);
    });

    it('должен правильно пересчитывать урон с бонусами', () => {
      const stats = StatsCalculator.calculateStatsWithBonus(mockCharacter, 3, 2, 0);

      const expectedDamage = 13 + Math.floor(10 / 2);
      expect(stats.damage).toBe(expectedDamage);
    });

    it('должен работать с пустыми бонусами (значения по умолчанию)', () => {
      const stats = StatsCalculator.calculateStatsWithBonus(mockCharacter);

      expect(stats.strength).toBe(10);
      expect(stats.agility).toBe(8);
      expect(stats.intelligence).toBe(5);
    });

    it('должен применять бонусы вместе с экипировкой', () => {
      const characterWithItem: Character = {
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [
            {
              id: 1,
              inventoryId: 1,
              itemId: 1,
              quantity: 1,
              enhancement: 0,
              isEquipped: true,
              item: {
                id: 1,
                name: 'Ring',
                type: 'accessory',
                description: 'Magic ring',
                damage: 0,
                armor: 0,
                bonusStr: 2,
                bonusAgi: 1,
                bonusInt: 3,
                price: 100,
                minStrength: 0,
                minAgility: 0,
                minIntelligence: 0,
                minLevel: 1,
              },
            },
          ],
        },
      };

      const stats = StatsCalculator.calculateStatsWithBonus(characterWithItem, 3, 2, 1);

      expect(stats.strength).toBe(10 + 2 + 3);
      expect(stats.agility).toBe(8 + 1 + 2);
      expect(stats.intelligence).toBe(5 + 3 + 1);
    });
  });
});