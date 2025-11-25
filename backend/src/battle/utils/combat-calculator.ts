import type { Zone } from '../../../../shared/types/battle.types';

export class CombatCalculator {
  static calculateDamage(
    attacks: [Zone, Zone],
    defenses: [Zone, Zone, Zone],
    baseDamage: number,
    armor: number,
  ): number {
    let totalDamage = 0;

    for (const attack of attacks) {
      const isBlocked = defenses.includes(attack);

      if (!isBlocked) {
        totalDamage += baseDamage;
      } else {
        const armorReduction = armor * 0.3;
        const reducedDamage = Math.max(0, baseDamage - armorReduction);
        totalDamage += reducedDamage;
      }
    }

    return Math.floor(totalDamage);
  }
}
