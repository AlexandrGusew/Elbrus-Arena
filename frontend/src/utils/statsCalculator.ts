import type { Character } from '../types/api';

export class StatsCalculator {
  private static applyEnhancementBonus(baseStat: number, enhancement: number): number {
    return Math.floor(baseStat * (1 + enhancement * 0.1));
  }

  static calculateEffectiveStats(character: Character) {
    const equippedItems = character.inventory.items.filter(item => item.isEquipped);

    let totalArmor = character.armor;
    let totalStrength = character.strength;
    let totalAgility = character.agility;
    let totalIntelligence = character.intelligence;
    let weaponDamage = 0;

    for (const invItem of equippedItems) {
      const itemArmor = this.applyEnhancementBonus(invItem.item.armor, invItem.enhancement);
      const itemBonusStr = this.applyEnhancementBonus(invItem.item.bonusStr, invItem.enhancement);
      const itemBonusAgi = this.applyEnhancementBonus(invItem.item.bonusAgi, invItem.enhancement);
      const itemBonusInt = this.applyEnhancementBonus(invItem.item.bonusInt, invItem.enhancement);

      totalArmor += itemArmor;
      totalStrength += itemBonusStr;
      totalAgility += itemBonusAgi;
      totalIntelligence += itemBonusInt;

      if (invItem.item.type === 'weapon') {
        weaponDamage = this.applyEnhancementBonus(invItem.item.damage, invItem.enhancement);
      }
    }

    const baseDamage = totalStrength + Math.floor(totalAgility / 2);
    const totalDamage = baseDamage + weaponDamage;

    return {
      strength: totalStrength,
      agility: totalAgility,
      intelligence: totalIntelligence,
      armor: totalArmor,
      damage: totalDamage,
      maxHp: character.maxHp,
      currentHp: character.currentHp,
    };
  }

  static calculateStatsWithBonus(
    character: Character,
    bonusStr: number = 0,
    bonusAgi: number = 0,
    bonusInt: number = 0
  ) {
    const tempCharacter = {
      ...character,
      strength: character.strength + bonusStr,
      agility: character.agility + bonusAgi,
      intelligence: character.intelligence + bonusInt,
    };

    return this.calculateEffectiveStats(tempCharacter);
  }
}