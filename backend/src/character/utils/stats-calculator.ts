import { Character, InventoryItem, Item } from '@prisma/client';

export class StatsCalculator {
  /**
   * Применяет бонус от заточки к базовой стате
   * Формула: baseStat + (baseStat * enhancement * 0.1)
   * +1 = +10%, +2 = +20%, +3 = +30%
   */
  private static applyEnhancementBonus(baseStat: number, enhancement: number): number {
    return Math.floor(baseStat + (baseStat * enhancement * 0.1));
  }

  static calculateEffectiveArmor(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalArmor = character.armor;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        // Применяем бонус от заточки к броне предмета
        const itemArmor = this.applyEnhancementBonus(invItem.item.armor, invItem.enhancement);
        totalArmor += itemArmor;
      }
    }

    return totalArmor;
  }

  static calculateEffectiveStrength(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalStrength = character.strength;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        // Применяем бонус от заточки к силе предмета
        const itemBonus = this.applyEnhancementBonus(invItem.item.bonusStr, invItem.enhancement);
        totalStrength += itemBonus;
      }
    }

    return totalStrength;
  }

  static calculateEffectiveAgility(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalAgility = character.agility;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        // Применяем бонус от заточки к ловкости предмета
        const itemBonus = this.applyEnhancementBonus(invItem.item.bonusAgi, invItem.enhancement);
        totalAgility += itemBonus;
      }
    }

    return totalAgility;
  }

  static calculateEffectiveIntelligence(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalIntelligence = character.intelligence;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        // Применяем бонус от заточки к интеллекту предмета
        const itemBonus = this.applyEnhancementBonus(invItem.item.bonusInt, invItem.enhancement);
        totalIntelligence += itemBonus;
      }
    }

    return totalIntelligence;
  }

  static calculatePlayerDamage(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    const effectiveStrength = this.calculateEffectiveStrength(character, equippedItems);
    const effectiveAgility = this.calculateEffectiveAgility(character, equippedItems);

    let baseDamage = effectiveStrength + Math.floor(effectiveAgility / 2);

    for (const invItem of equippedItems) {
      if (invItem.isEquipped && invItem.item.type === 'weapon') {
        // Применяем бонус от заточки к урону оружия
        const weaponDamage = this.applyEnhancementBonus(invItem.item.damage, invItem.enhancement);
        baseDamage += weaponDamage;
      }
    }

    return baseDamage;
  }

  static calculateMaxHP(character: Character): number {
    return character.maxHp;
  }
}
