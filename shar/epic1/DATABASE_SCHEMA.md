# СХЕМА БАЗЫ ДАННЫХ - MVP (ФИНАЛЬНАЯ)

## Таблицы (10 штук)

---

### 1. User (Пользователь)
```
id              - число (авто)
telegramId      - число (уникальное)
username        - строка (может быть null)
firstName       - строка (может быть null)
createdAt       - дата
```

**Связи:**
- Имеет 1 персонажа (Character)

---

### 2. Character (Персонаж)
```
id              - число (авто)
userId          - число (связь с User, уникальное)
name            - строка (уникальное имя)
class           - строка (warrior/mage/assassin)
level           - число (по умолчанию 1)
experience      - число (по умолчанию 0)

// Характеристики (устанавливаются в коде при создании по классу)
strength        - число (по умолчанию 0)
agility         - число (по умолчанию 0)
intelligence    - число (по умолчанию 0)
freePoints      - число (по умолчанию 0)

// Ресурсы (устанавливаются в коде при создании по классу)
maxHp           - число (по умолчанию 100)
currentHp       - число (по умолчанию 100)
gold            - число (по умолчанию 100)
stamina         - число (по умолчанию 100)
rating          - число (по умолчанию 0)

createdAt       - дата
```

**Связи:**
- Принадлежит User (userId)
- Имеет 1 инвентарь (Inventory)
- Участвует в PvP боях (PvpBattle)
- Участвует в PvE боях (PveBattle)

**Стартовые характеристики (устанавливаются в коде):**
```
Воин:    strength: 15, agility: 8,  intelligence: 5,  maxHp: 150, currentHp: 150
Убийца:  strength: 8,  agility: 15, intelligence: 8,  maxHp: 100, currentHp: 100
Маг:     strength: 5,  agility: 10, intelligence: 15, maxHp: 120, currentHp: 120
```

---

### 3. Monster (Монстр)
```
id              - число (авто)
name            - строка
hp              - число
damage          - число
armor           - число
isBoss          - булево (по умолчанию false)
```

**Связи:**
- Появляется в данжах (DungeonMonster)

---

### 4. Dungeon (Данж)
```
id              - число (авто)
name            - строка
difficulty      - строка (easy/medium/hard)
staminaCost     - число (по умолчанию 20)
expReward       - число
goldReward      - число
```

**Связи:**
- Имеет монстров (DungeonMonster)
- Имеет бои (PveBattle)

---

### 5. DungeonMonster (Связь данжа и монстра)
```
id              - число (авто)
dungeonId       - число (связь с Dungeon)
monsterId       - число (связь с Monster)
position        - число (1-4 обычные, 5 босс)
```

**Зачем:** Определяет каких монстров и в каком порядке встречать в данже

---

### 6. Item (Шаблон предмета - как в магазине)
```
id              - число (авто)
name            - строка
type            - строка (weapon/helmet/armor/belt/legs/potion)

// Характеристики предмета
damage          - число (по умолчанию 0)
armor           - число (по умолчанию 0)
bonusStr        - число (по умолчанию 0)
bonusAgi        - число (по умолчанию 0)
bonusInt        - число (по умолчанию 0)
price           - число (по умолчанию 0)

// Требования для надевания
minStrength     - число (по умолчанию 0)
minAgility      - число (по умолчанию 0)
minIntelligence - число (по умолчанию 0)
minLevel        - число (по умолчанию 1)
```

**Типы:**
- weapon - оружие
- helmet - шлем
- armor - броня
- belt - пояс
- legs - ноги
- potion - зелье

**Зачем:** Шаблон предмета. Все игроки видят один и тот же "Меч героя" с уроном 20.

---

### 7. Inventory (Коробка инвентаря персонажа)
```
id              - число (авто)
characterId     - число (связь с Character, уникальное)
size            - число (по умолчанию 20)
createdAt       - дата
```

**Зачем:** Хранит размер инвентаря персонажа. Создается автоматически при создании персонажа.

**Связи:**
- Принадлежит Character (characterId)
- Имеет много предметов (InventoryItem)

---

### 8. InventoryItem (Конкретный предмет в инвентаре)
```
id              - число (авто)
inventoryId     - число (связь с Inventory)
itemId          - число (связь с Item)
quantity        - число (по умолчанию 1)
enhancement     - число (уровень заточки 0-10, по умолчанию 0)
isEquipped      - булево (по умолчанию false)
```

**Зачем:** Конкретный предмет у игрока. У одного игрока "Меч героя +5", у другого "Меч героя +10".

**Связи:**
- Принадлежит Inventory (inventoryId)
- Ссылается на шаблон Item (itemId)

---

### 9. PvpBattle (PvP бой)
```
id              - строка (uuid)
player1Id       - число (связь с Character)
player2Id       - число (связь с Character)
winnerId        - число (может быть null)
status          - строка (active/completed)
ratingChange    - число (по умолчанию 0)
rounds          - JSON (массив раундов)
createdAt       - дата
```

**Зачем:** Сохраняет историю PvP боев

---

### 10. PveBattle (PvE бой)
```
id              - строка (uuid)
characterId     - число (связь с Character)
dungeonId       - число (связь с Dungeon)
currentMonster  - число (по умолчанию 1)
characterHp     - число
monsterHp       - число
status          - строка (active/completed/abandoned)
rounds          - JSON (массив раундов)
createdAt       - дата
```

**Зачем:** Сохраняет прогресс прохождения данжа

---

## Примеры данных для seed

### Монстры (5 штук)
```
1. Крыса       - HP: 50,  Урон: 5,  Броня: 0,  isBoss: false
2. Гоблин      - HP: 70,  Урон: 8,  Броня: 3,  isBoss: false
3. Скелет      - HP: 90,  Урон: 10, Броня: 5,  isBoss: false
4. Орк         - HP: 110, Урон: 12, Броня: 8,  isBoss: false
5. Демон       - HP: 250, Урон: 25, Броня: 15, isBoss: true
```

### Предметы (10 штук)

**Оружие:**
```
1. Ржавый меч
   - damage: 5, price: 10
   - minStrength: 0, minLevel: 1

2. Стальной меч
   - damage: 10, price: 50
   - minStrength: 10, minLevel: 3

3. Меч героя
   - damage: 20, price: 200
   - minStrength: 20, minLevel: 10
```

**Броня:**
```
4. Кожанка
   - armor: 5, price: 15
   - minStrength: 0, minLevel: 1

5. Кольчуга
   - armor: 10, price: 60
   - minStrength: 15, minLevel: 5
```

**Шлем:**
```
6. Шапка
   - armor: 2, price: 5
   - minLevel: 1

7. Шлем
   - armor: 5, price: 25
   - minStrength: 10, minLevel: 3
```

**Остальное:**
```
8. Сапоги
   - armor: 3, price: 10
   - minLevel: 1

9. Пояс
   - armor: 2, bonusStr: 1, price: 20
   - minStrength: 5, minLevel: 2

10. Зелье HP
    - price: 20
    - minLevel: 1
```

### Данжи (1 данж, 3 сложности)
```
1. Подземелье (Easy)
   - difficulty: 'easy'
   - staminaCost: 20, expReward: 50, goldReward: 30

2. Подземелье (Medium)
   - difficulty: 'medium'
   - staminaCost: 20, expReward: 75, goldReward: 45

3. Подземелье (Hard)
   - difficulty: 'hard'
   - staminaCost: 20, expReward: 100, goldReward: 60
```

### Монстры по данжам (DungeonMonster)
```
Easy (dungeonId: 1):
  - position 1: Крыса (monsterId: 1)
  - position 2: Гоблин (monsterId: 2)
  - position 3: Крыса (monsterId: 1)
  - position 4: Гоблин (monsterId: 2)
  - position 5: Демон (monsterId: 5) - босс

Medium (dungeonId: 2):
  - position 1: Гоблин (monsterId: 2)
  - position 2: Скелет (monsterId: 3)
  - position 3: Орк (monsterId: 4)
  - position 4: Скелет (monsterId: 3)
  - position 5: Демон (monsterId: 5) - босс

Hard (dungeonId: 3):
  - position 1: Скелет (monsterId: 3)
  - position 2: Орк (monsterId: 4)
  - position 3: Орк (monsterId: 4)
  - position 4: Орк (monsterId: 4)
  - position 5: Демон (monsterId: 5) - босс
```

---

## Формулы расчета

### Урон
```
Базовый урон = Урон оружия + Основная характеристика класса

Для Воина:    Базовый урон = weapon.damage + character.strength
Для Убийцы:   Базовый урон = weapon.damage + character.agility
Для Мага:     Базовый урон = weapon.damage + character.intelligence

Если атака попала в защищаемую зону:
  Урон после блока = Базовый урон - (Броня противника × 0.6)

Минимальный урон всегда = 1
```

### Проверка экипировки предмета
```

Можно надеть предмет если:
  character.strength >= item.minStrength
  И character.agility >= item.minAgility
  И character.intelligence >= item.minIntelligence
  И character.level >= item.minLevel

```

---

## Что НЕ делаем в MVP
❌ Таблица Classes (делаем через код)
❌ Способности классов
❌ Критические удары
❌ Уклонение
❌ Telegram авторизация (пока)
❌ Сложные механики боя
❌ Гильдии
❌ Торговля между игроками

---

## Итого
**10 таблиц:**
1. User
2. Character
3. Monster
4. Dungeon
5. DungeonMonster
6. Item
7. Inventory (коробка)
8. InventoryItem (предметы в коробке)
9. PvpBattle
10. PveBattle

**Seed данные:**
- 5 монстров
- 10 предметов
- 3 данжа (1 данж × 3 сложности)
- 15 связей DungeonMonster

**Максимально просто и работает!**