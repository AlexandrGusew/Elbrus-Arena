import { ItemType } from './enums';

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  damage: number;
  armor: number;
  bonusStr: number;
  bonusAgi: number;
  bonusInt: number;
  price: number;
  minStrength: number;
  minAgility: number;
  minIntelligence: number;
  minLevel: number;
}

export interface InventoryItem {
  id: number;
  inventoryId: number;
  itemId: number;
  item: Item;
  quantity: number;
  enhancement: number; // это заточка
  isEquipped: boolean;
}

export interface Inventory {
  id: number;
  characterId: number;
  size: number;
  items: InventoryItem[];
  createdAt: Date;
}