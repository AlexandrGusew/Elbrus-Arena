import { Dungeon, Enemy } from '../types/game';

export const dungeons: Dungeon[] = [
  {
    id: '1',
    name: 'Dark Forest',
    difficulty: 'easy',
    level: 1,
    rewards: { gold: 100, exp: 50 },
    staminaCost: 10
  },
  {
    id: '2',
    name: 'Abandoned Mine',
    difficulty: 'normal',
    level: 3,
    rewards: { gold: 250, exp: 150 },
    staminaCost: 15
  },
  {
    id: '3',
    name: 'Cursed Temple',
    difficulty: 'hard',
    level: 5,
    rewards: { gold: 500, exp: 300 },
    staminaCost: 20
  },
  {
    id: '4',
    name: 'Dragon Lair',
    difficulty: 'extreme',
    level: 10,
    rewards: { gold: 1000, exp: 750 },
    staminaCost: 30
  }
];

export const enemies: Enemy[] = [
  {
    name: 'Shadow Wolf',
    health: 100,
    maxHealth: 100,
    level: 1,
    damage: 15,
    defense: 5
  },
  {
    name: 'Corrupted Miner',
    health: 200,
    maxHealth: 200,
    level: 3,
    damage: 25,
    defense: 10
  },
  {
    name: 'Ancient Guardian',
    health: 350,
    maxHealth: 350,
    level: 5,
    damage: 40,
    defense: 20
  },
  {
    name: 'Cyber Dragon',
    health: 800,
    maxHealth: 800,
    level: 10,
    damage: 75,
    defense: 40
  }
];

export const classData = {
  warrior: {
    name: 'Warrior',
    icon: '⚔️',
    description: 'Masters of close combat with heavy armor and devastating melee attacks',
    baseStats: {
      health: 120,
      strength: 15,
      instinct: 8,
      agility: 7
    }
  },
  assassin: {
    name: 'Assassin',
    icon: '🗡️',
    description: 'Swift and deadly, excelling in critical strikes and evasion',
    baseStats: {
      health: 90,
      strength: 12,
      instinct: 12,
      agility: 16
    }
  },
  mage: {
    name: 'Mage',
    icon: '🔮',
    description: 'Wielders of arcane power, dealing massive magical damage from range',
    baseStats: {
      health: 80,
      strength: 8,
      instinct: 18,
      agility: 9
    }
  }
};
