export type CharacterClass = 'warrior' | 'assassin' | 'mage';

export interface Character {
  name: string;
  class: CharacterClass;
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  stamina: number;
  maxStamina: number;
  pvpRating: number;
  wins: number;
  losses: number;
  stats: {
    health: number;
    strength: number;
    instinct: number;
    agility: number;
  };
  freePoints: number;
}

export interface Enemy {
  name: string;
  health: number;
  maxHealth: number;
  level: number;
  damage: number;
  defense: number;
}

export interface Dungeon {
  id: string;
  name: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  level: number;
  rewards: {
    gold: number;
    exp: number;
  };
  staminaCost: number;
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'player' | 'enemy' | 'system';
}

export interface BattleState {
  player: {
    health: number;
    maxHealth: number;
    attackZones: number[];
    defenseZones: number[];
  };
  enemy: Enemy;
  round: number;
  logs: BattleLog[];
  isPlayerTurn: boolean;
}
