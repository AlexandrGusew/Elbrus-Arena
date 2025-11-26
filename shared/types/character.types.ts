import { CharacterClass } from './enums';
import { Inventory } from './item.types';

export interface Character {
  id: number;
  userId: number;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  strength: number;
  agility: number;
  intelligence: number;
  freePoints: number;
  maxHp: number;
  currentHp: number;
  armor: number;
  gold: number;
  stamina: number;
  lastStaminaUpdate: string;
  rating: number;
  createdAt: string;
  inventory: Inventory;
}

export interface CreateCharacterDto {
  telegramId: number;  // Telegram ID пользователя (бэкенд сам создаст/найдет User)
  name: string;
  class: CharacterClass;
}