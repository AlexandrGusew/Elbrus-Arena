# База данных и API для MVP (Prisma)

## Prisma Schema

```prisma
// schema.prisma

model User {
  id         Int       @id @default(autoincrement())
  telegramId BigInt    @unique
  username   String?
  firstName  String?
  character  Character?
  createdAt  DateTime  @default(now())
}

model Character {
  id           Int      @id @default(autoincrement())
  userId       Int      @unique
  user         User     @relation(fields: [userId], references: [id])
  name         String   @unique
  class        String   // warrior, mage, assassin
  level        Int      @default(1)
  experience   Int      @default(0)
  
  // Статы
  strength     Int      @default(5)
  agility      Int      @default(5)
  intelligence Int      @default(5)
  freePoints   Int      @default(0)
  
  // Ресурсы
  maxHp        Int      @default(100)
  currentHp    Int      @default(100)
  gold         Int      @default(100)
  stamina      Int      @default(100)
  rating       Int      @default(0)
  
  // Связи
  inventory    Inventory[]
  pvpBattles1  PvpBattle[] @relation("Player1")
  pvpBattles2  PvpBattle[] @relation("Player2")
  pveBattles   PveBattle[]
  
  createdAt    DateTime @default(now())
}

model Monster {
  id          Int      @id @default(autoincrement())
  name        String
  hp          Int
  damage      Int
  armor       Int
  isBoss      Boolean  @default(false)
  
  // В каких данжах встречается
  dungeons    DungeonMonster[]
}

model Dungeon {
  id          Int      @id @default(autoincrement())
  name        String
  difficulty  String   // easy, medium, hard
  staminaCost Int      @default(20)
  expReward   Int
  goldReward  Int
  
  // Список монстров
  monsters    DungeonMonster[]
  battles     PveBattle[]
}

model DungeonMonster {
  id         Int      @id @default(autoincrement())
  dungeonId  Int
  dungeon    Dungeon  @relation(fields: [dungeonId], references: [id])
  monsterId  Int
  monster    Monster  @relation(fields: [monsterId], references: [id])
  position   Int      // 1-4 обычные, 5 босс
}

model Item {
  id          Int      @id @default(autoincrement())
  name        String
  type        String   // weapon, helmet, armor, belt, legs, potion
  damage      Int      @default(0)
  armor       Int      @default(0)
  bonusStr    Int      @default(0)
  bonusAgi    Int      @default(0)
  bonusInt    Int      @default(0)
  price       Int      @default(0)
  
  inventory   Inventory[]
}

model Inventory {
  id            Int      @id @default(autoincrement())
  characterId   Int
  character     Character @relation(fields: [characterId], references: [id])
  itemId        Int
  item          Item     @relation(fields: [itemId], references: [id])
  quantity      Int      @default(1)
  enhancement   Int      @default(0) // 0-10
  isEquipped    Boolean  @default(false)
}

model PvpBattle {
  id           String   @id @default(uuid())
  player1Id    Int
  player1      Character @relation("Player1", fields: [player1Id], references: [id])
  player2Id    Int
  player2      Character @relation("Player2", fields: [player2Id], references: [id])
  winnerId     Int?
  status       String   // active, completed
  ratingChange Int      @default(0)
  rounds       Json     // массив раундов
  createdAt    DateTime @default(now())
}

model PveBattle {
  id              String   @id @default(uuid())
  characterId     Int
  character       Character @relation(fields: [characterId], references: [id])
  dungeonId       Int
  dungeon         Dungeon  @relation(fields: [dungeonId], references: [id])
  currentMonster  Int      @default(1)
  characterHp     Int
  monsterHp       Int
  status          String   // active, completed, abandoned
  rounds          Json     // массив раундов
  createdAt       DateTime @default(now())
}
```

---

## API Endpoints

### 1. Авторизация

```
POST /auth/telegram
Body: { initData: string }
Response: { 
  token: string,
  user: User,
  hasCharacter: boolean
}
```

### 2. Персонаж

```
POST /character/create
Body: { 
  name: string,
  class: 'warrior' | 'mage' | 'assassin'
}
Response: { character: Character }

GET /character
Response: { character: Character }

POST /character/levelup
Body: {
  strength?: number,
  agility?: number,
  intelligence?: number
}
Response: { character: Character }
```

### 3. PvE Данжи

```
GET /dungeons
Response: { 
  dungeons: [{
    id: number,
    name: string,
    difficulty: string,
    staminaCost: number,
    monsters: Monster[]
  }]
}

POST /pve/start
Body: { dungeonId: number }
Response: { 
  battleId: string,
  monster: Monster
}

POST /pve/action
Body: {
  battleId: string,
  attackZones: string[], // 2 зоны
  defenseZones: string[] // 3 зоны
}
Response: {
  playerDamage: number,
  monsterDamage: number,
  playerHp: number,
  monsterHp: number,
  monsterDefeated: boolean,
  nextMonster?: Monster,
  dungeonComplete?: boolean,
  rewards?: {
    exp: number,
    gold: number,
    items: Item[]
  }
}

POST /pve/usePotion
Body: { battleId: string }
Response: { newHp: number }
```

### 4. PvP Арена

```
POST /pvp/search
Response: { searching: true }

POST /pvp/cancel
Response: { cancelled: true }

WebSocket события:
- matchFound: { opponentId, battleId }
- yourTurn: { timeLeft: 10 }
- opponentAction: { zones }
- roundResult: { damages, hps }
- battleEnd: { winnerId, ratingChange }
```

### 5. Инвентарь

```
GET /inventory
Response: {
  items: Inventory[],
  equipped: {
    weapon?: Item,
    helmet?: Item,
    armor?: Item,
    belt?: Item,
    legs?: Item
  }
}

POST /inventory/equip
Body: { inventoryId: number }
Response: { success: boolean }

POST /inventory/unequip  
Body: { slot: string }
Response: { success: boolean }

POST /inventory/sell
Body: { inventoryId: number }
Response: { 
  success: boolean,
  goldReceived: number
}
```

### 6. Магазин

```
GET /shop
Response: {
  items: [{
    id: number,
    name: string,
    price: number,
    type: string
  }]
}

POST /shop/buy
Body: { itemId: number }
Response: { 
  success: boolean,
  newGold: number
}
```

### 7. Кузнец

```
POST /blacksmith/enhance
Body: { inventoryId: number }
Response: {
  success: boolean, // 30% шанс
  newLevel: number,
  goldSpent: number
}
```

### 8. Таблица лидеров

```
GET /leaderboard
Response: {
  players: [{
    rank: number,
    name: string,
    class: string,
    level: number,
    rating: number
  }]
}
```

---

## Что нужно добавить в seed.ts

```typescript
// seed.ts

// 1. Создаем предметы
const items = [
  // Оружие
  { name: 'Ржавый меч', type: 'weapon', damage: 5, price: 10 },
  { name: 'Стальной меч', type: 'weapon', damage: 10, price: 50 },
  { name: 'Меч героя', type: 'weapon', damage: 20, price: 200 },
  
  // Броня
  { name: 'Кожанка', type: 'armor', armor: 5, price: 15 },
  { name: 'Кольчуга', type: 'armor', armor: 10, price: 60 },
  
  // Шлемы
  { name: 'Шапка', type: 'helmet', armor: 2, price: 5 },
  { name: 'Шлем', type: 'helmet', armor: 5, price: 25 },
  
  // Остальное
  { name: 'Сапоги', type: 'legs', armor: 3, price: 10 },
  { name: 'Пояс', type: 'belt', armor: 2, bonusStr: 1, price: 20 },
  
  // Зелья
  { name: 'Зелье здоровья', type: 'potion', price: 20 }
];

// 2. Создаем монстров
const monsters = [
  { name: 'Крыса', hp: 50, damage: 5, armor: 0 },
  { name: 'Гоблин', hp: 70, damage: 8, armor: 3 },
  { name: 'Скелет', hp: 90, damage: 10, armor: 5 },
  { name: 'Орк', hp: 110, damage: 12, armor: 8 },
  { name: 'Демон', hp: 250, damage: 25, armor: 15, isBoss: true }
];

// 3. Создаем данжи
const dungeons = [
  { 
    name: 'Подземелье', 
    difficulty: 'easy',
    expReward: 50,
    goldReward: 30
  },
  {
    name: 'Подземелье',
    difficulty: 'medium', 
    expReward: 75,
    goldReward: 45
  },
  {
    name: 'Подземелье',
    difficulty: 'hard',
    expReward: 100,
    goldReward: 60
  }
];

// 4. Связываем монстров с данжами
// Easy: крыса, гоблин + босс
// Medium: гоблин, скелет, орк + босс  
// Hard: скелет, орк, орк, орк + босс
```

---

## Формулы расчета (в сервисах)

```typescript
// BattleService.ts

calculateDamage(attacker, defender, attackZones, defenseZones) {
  let totalDamage = 0;
  
  for (let zone of attackZones) {
    // Базовый урон
    let damage = attacker.damage + attacker.strength;
    
    // Модификатор зоны
    if (zone === 'head') damage *= 1.1;
    if (zone === 'legs') damage *= 0.8;
    
    // Если зона защищена
    if (defenseZones.includes(zone)) {
      damage = damage - (defender.armor * 0.6);
    }
    
    // Крит (15% + agility * 0.3%)
    const critChance = 15 + attacker.agility * 0.3;
    if (Math.random() * 100 < critChance) {
      damage *= 2;
    }
    
    totalDamage += Math.max(1, Math.floor(damage));
  }
  
  return totalDamage;
}
```

---

## Что НЕ делаем в MVP:
- Способности классов
- Много данжей (только 1 с 3 сложностями)
- Сложные дропы
- Гильдии
- Торговлю
- Платные кристаллы

---

## Порядок разработки:
1. Создать Prisma схему
2. Сделать миграцию и seed
3. Реализовать авторизацию
4. Создание персонажа
5. PvE бои
6. PvP через WebSocket
7. Инвентарь и магазин
8. Кузнец
9. Таблица лидеров
