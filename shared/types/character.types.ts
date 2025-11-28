import { CharacterClass } from './enums';
import { Inventory } from './item.types';
import { Specialization } from './specialization.types';

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
  superPoints: number;
  createdAt: string;
  inventory: Inventory;
  specialization?: Specialization | null;
}

export interface CreateCharacterDto {
  telegramId: number;  // Telegram ID пользователя (бэкенд сам создаст/найдет User)
  name: string;
  class: CharacterClass;
}