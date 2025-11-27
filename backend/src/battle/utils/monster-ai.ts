import type { Zone, RoundActions } from '../../../../shared/types/battle.types';

export class MonsterAI {
  private static readonly ATTACK_ZONES: Zone[] = ['head', 'body', 'legs', 'arms'];
  private static readonly DEFENSE_ZONES: Zone[] = ['head', 'body', 'legs', 'arms', 'back'];

  static generateActions(): RoundActions {
    return {
      attacks: [this.randomAttackZone(), this.randomAttackZone()],
      defenses: [this.randomDefenseZone(), this.randomDefenseZone(), this.randomDefenseZone()],
    };
  }

  private static randomAttackZone(): Zone {
    return this.ATTACK_ZONES[Math.floor(Math.random() * this.ATTACK_ZONES.length)];
  }

  private static randomDefenseZone(): Zone {
    return this.DEFENSE_ZONES[Math.floor(Math.random() * this.DEFENSE_ZONES.length)];
  }
}
