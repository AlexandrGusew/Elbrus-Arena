
export const CHARACTER_CLASSES = ['warrior', 'mage', 'rogue'] as const;
export type CharacterClass = typeof CHARACTER_CLASSES[number];


export const ITEM_TYPES = ['weapon', 'helmet', 'armor', 'belt', 'legs', 'accessory', 'potion', 'shield', 'offhand', 'scroll'] as const;
export type ItemType = typeof ITEM_TYPES[number];


export const DUNGEON_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type DungeonDifficulty = typeof DUNGEON_DIFFICULTIES[number];


export const BATTLE_STATUSES = ['active', 'won', 'lost'] as const;
export type BattleStatusEnum = typeof BATTLE_STATUSES[number];


export const PVP_BATTLE_STATUSES = ['active', 'completed'] as const;
export type PvpBattleStatus = typeof PVP_BATTLE_STATUSES[number];


export const SPECIALIZATION_BRANCHES = [
  'PALADIN',
  'BARBARIAN',
  'SHADOW_DANCER',
  'POISONER',
  'FROST_MAGE',
  'WARLOCK',
] as const;
export type SpecializationBranch = typeof SPECIALIZATION_BRANCHES[number];