// Единый источник типов для боевой системы
// Используется на фронте и бэке

export type Zone = 'head' | 'body' | 'legs' | 'arms' | 'back';

export interface BattleAbility {
  id: number;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;  // Сколько ходов осталось до доступности
  effects: Record<string, any>;  // Эффекты способности
}

export interface RoundActions {
  attacks: [Zone, Zone];  // 2 атаки
  defenses: [Zone, Zone, Zone];  // 3 защиты (из 4 зон одна остается открытой)
  abilityId?: number;  // ID использованной способности (опционально)
}

export interface RoundResult {
  roundNumber: number;
  playerActions: RoundActions;
  monsterActions: RoundActions;
  playerDamage: number;  // урон игроку
  monsterDamage: number;  // урон монстру
  playerHp: number;
  monsterHp: number;
}

export interface Battle {
  id: string;
  characterId: number;
  dungeonId: number;
  currentMonster: number;
  totalMonsters: number;  // Общее количество монстров в подземелье
  characterHp: number;
  monsterHp: number;
  status: 'active' | 'won' | 'lost';
  rounds: RoundResult[];
  availableAbilities?: BattleAbility[];  // Доступные способности персонажа
}

export interface LootedItem {
  itemId: number;
  itemName: string;
  itemType: string;
  enhancement: number;
}

export type BattleState = {
  roundNumber: number;
  playerHp: number;
  monsterHp: number;
  status: 'waiting' | 'active' | 'won' | 'lost';
  lastRoundResult?: RoundResult;
  currentMonster?: number;
  totalMonsters?: number;
  lootedItems?: LootedItem[];
  expGained?: number;
  goldGained?: number;
};