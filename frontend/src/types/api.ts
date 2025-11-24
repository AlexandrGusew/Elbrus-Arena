/**
 * API типы для фронтенда
 */

import type {
  Character,
  CreateCharacterDto,
  CharacterClass,
  Dungeon,
  DungeonWithMonsters,
  DungeonDifficulty,
  Item,
  ItemType,
  InventoryItem,
  Inventory,
  User,
  CreateUserDto,
} from '@shared/types';

import {
  CHARACTER_CLASSES,
  DUNGEON_DIFFICULTIES,
  ITEM_TYPES,
} from '@shared/types';


export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}


export type {
  User,
  CreateUserDto,

  Character,
  CreateCharacterDto,
  CharacterClass,

  Dungeon,
  DungeonWithMonsters,
  DungeonDifficulty,

  Item,
  ItemType,
  InventoryItem,
  Inventory,
};


export {
  CHARACTER_CLASSES,
  DUNGEON_DIFFICULTIES,
  ITEM_TYPES,
};