import { Character, InventoryItem, Item } from '@prisma/client';

export class StatsCalculator {
  static calculateEffectiveArmor(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalArmor = character.armor;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        totalArmor += invItem.item.armor;
      }
    }

    return totalArmor;
  }

  static calculateEffectiveStrength(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalStrength = character.strength;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        totalStrength += invItem.item.bonusStr;
      }
    }

    return totalStrength;
  }

  static calculateEffectiveAgility(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalAgility = character.agility;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        totalAgility += invItem.item.bonusAgi;
      }
    }

    return totalAgility;
  }

  static calculateEffectiveIntelligence(character: Character, equippedItems: (InventoryItem & { item: Item })[]): number {
    let totalIntelligence = character.intelligence;

    for (const invItem of equippedItems) {
      if (invItem.isEquipped) {
        totalIntelligence += invItem.item.bonusInt;
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
        baseDamage += invItem.item.damage;
      }
    }

    return baseDamage;
  }

  static calculateMaxHP(character: Character): number {
    return character.maxHp;
  }
}
