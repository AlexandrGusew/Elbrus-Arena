import type { Zone, RoundActions } from '../../../../shared/types/battle.types';

export class MonsterAI {
  private static readonly ZONES: Zone[] = ['head', 'body', 'legs', 'arms'];

  static generateActions(): RoundActions {
    return {
      attacks: [this.randomZone(), this.randomZone()],
      defenses: [this.randomZone(), this.randomZone(), this.randomZone()],
    };
  }

  private static randomZone(): Zone {
    return this.ZONES[Math.floor(Math.random() * this.ZONES.length)];
  }
}
