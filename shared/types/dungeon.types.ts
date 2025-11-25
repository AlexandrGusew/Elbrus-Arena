import { DungeonDifficulty } from './enums';

export interface Monster {
  id: number;
  name: string;
  hp: number;
  damage: number;
  armor: number;
  isBoss: boolean;
}

export interface Dungeon {
  id: number;
  name: string;
  difficulty: DungeonDifficulty;
  staminaCost: number;
  expReward: number;
  goldReward: number;
}

export interface DungeonWithMonsters extends Dungeon {
  monsters: {
    id: number;
    position: number;
    monster: Monster;
  }[];
}