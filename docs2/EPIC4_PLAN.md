# EPIC 4: Расширенные механики игры

## Анализ текущего состояния

### Что уже реализовано (из shar/):
- ✅ Базовая система персонажей (3 класса: Warrior, Mage, Rogue)
- ✅ Зоновая боевая система (голова, тело, ноги)
- ✅ PvE бои с монстрами
- ✅ Система инвентаря и экипировки
- ✅ Заточка предметов (enhancement)
- ✅ Система прокачки (level, exp, stat points)
- ✅ JWT авторизация
- ✅ WebSocket инфраструктура (для будущего PvP)

### Что нужно добавить (новая итерация):

---

## 1. ДРЕВО НАВЫКОВ (Skill Tree)

### Backend

#### Prisma Schema
```prisma
model SkillTree {
  id            Int       @id @default(autoincrement())
  name          String    // "Warrior Tree", "Mage Tree", "Rogue Tree"
  class         CharacterClass
  skills        Skill[]
}

model Skill {
  id            Int       @id @default(autoincrement())
  skillTreeId   Int
  skillTree     SkillTree @relation(fields: [skillTreeId], references: [id])

  name          String    // "Heavy Strike", "Fireball"
  description   String
  icon          String?

  tier          Int       // 1, 2, 3 (уровень ветки)
  position      Int       // позиция в ряду
  maxLevel      Int       @default(5)

  requiredSkillId Int?    // ID навыка-пререквизита
  requiredSkill   Skill?  @relation("SkillDependencies", fields: [requiredSkillId], references: [id])
  dependentSkills Skill[] @relation("SkillDependencies")

  requiredLevel Int       // минимальный уровень персонажа

  // Эффекты навыка (JSON)
  effects       Json      // {type: "damage_boost", value: 10, per_level: 5}

  characterSkills CharacterSkill[]
}

model CharacterSkill {
  id            Int       @id @default(autoincrement())
  characterId   Int
  character     Character @relation(fields: [characterId], references: [id])

  skillId       Int
  skill         Skill     @relation(fields: [skillId], references: [id])

  level         Int       @default(1)

  @@unique([characterId, skillId])
}
```

#### Модуль SkillModule
- **SkillService**:
  - `getSkillTree(characterClass)` - получить древо для класса
  - `learnSkill(characterId, skillId)` - изучить навык
  - `upgradeSkill(characterId, skillId)` - повысить уровень навыка
  - `getCharacterSkills(characterId)` - навыки персонажа
  - `validateSkillRequirements()` - проверка пререквизитов

- **SkillController**:
  - GET `/skills/tree/:class` - древо навыков класса
  - GET `/skills/character/:characterId` - навыки персонажа
  - POST `/skills/learn` - изучить навык (тратит skill points)
  - POST `/skills/upgrade` - повысить уровень

#### Seed данных (3 древа по 15 навыков)

**Warrior Tree:**
- Tier 1: Heavy Strike (+10% физ урона), Shield Mastery (+5% блок)
- Tier 2: Cleave (атака 2 зон), Iron Skin (+10 брони)
- Tier 3: Berserker Rage (+15% урона, -10% защиты)

**Mage Tree:**
- Tier 1: Arcane Bolt (+10% маг урона), Mana Shield (+5% уворота)
- Tier 2: Chain Lightning (атака 3 зон), Frost Nova (замедление)
- Tier 3: Meteor Strike (огромный урон 1 зона)

**Rogue Tree:**
- Tier 1: Backstab (+15% крит урон), Shadow Step (+5% уворота)
- Tier 2: Poison Blade (урон со временем), Evasion (+10% уворота)
- Tier 3: Assassinate (гарантированный крит)

### Frontend

#### Компоненты
- `SkillTreePage` - страница с древом навыков
- `SkillNode` - нода навыка (круглая кнопка)
- `SkillTooltip` - подсказка с описанием
- `SkillPath` - линия связи между навыками

#### UI/UX
- Вертикальное дерево (3 тира сверху вниз)
- Цветовая кодировка:
  - Серый = недоступен
  - Желтый = доступен для изучения
  - Зеленый = изучен
- Анимация при изучении навыка
- Отображение skill points вверху экрана

---

## 2. СИСТЕМА СПОСОБНОСТЕЙ КЛАССОВ

### Backend

#### Обновление Prisma Schema
```prisma
model ClassAbility {
  id            Int       @id @default(autoincrement())
  class         CharacterClass
  name          String    // "Rage", "Stealth", "Super Mind"
  description   String
  cooldown      Int       // раундов кулдауна
  duration      Int       // раундов действия

  // Эффекты
  effects       Json      // {stat: "strength", modifier: 15, type: "percent"}
  sideEffects   Json?     // побочные эффекты
}

model CharacterAbilityUsage {
  id            Int       @id @default(autoincrement())
  characterId   Int
  character     Character @relation(fields: [characterId], references: [id])

  battleId      Int
  battle        Battle    @relation(fields: [battleId], references: [id])

  abilityId     Int
  ability       ClassAbility @relation(fields: [abilityId], references: [id])

  usedAt        DateTime  @default(now())
  roundNumber   Int
}
```

#### Обновление BattleService
- Добавить метод `useAbility(battleId, characterId, abilityId)`
- Проверка кулдауна
- Применение эффектов на N раундов
- Обработка побочных эффектов после окончания

#### Способности из документации:

**Warrior - "Rage" (Ярость)**:
```json
{
  "effects": {"strength": +15, "type": "percent", "duration": 2},
  "sideEffects": {"strength": -5, "type": "percent", "duration": 1}
}
```

**Rogue - "Stealth" (Скрытность)**:
```json
{
  "effects": {"evasion": +30, "type": "percent", "duration": 2},
  "sideEffects": {"nextHitCrit": true}
}
```

**Mage - "Super Mind" (Сверх-разум)**:
```json
{
  "effects": {"attackZones": +1, "duration": 2},
  "sideEffects": {"skipTurn": true}
}
```

### Frontend

#### Компоненты
- `AbilityButton` - кнопка способности в бою
- `AbilityIcon` - иконка с кулдауном
- `AbilityEffect` - визуальный эффект активации

#### UI
- Большая кнопка способности под зонами атаки/защиты
- Таймер кулдауна (круговой прогресс)
- Анимация при использовании
- Отображение активных эффектов над HP баром

---

## 3. ПРОФЕССИИ (Crafting Professions)

### Backend

#### Prisma Schema
```prisma
enum Profession {
  BLACKSMITH    // Кузнец - улучшение оружия/брони
  ALCHEMIST     // Алхимик - создание зелий
  ENCHANTER     // Зачаровыватель - добавление бонусов
}

model CharacterProfession {
  id            Int       @id @default(autoincrement())
  characterId   Int
  character     Character @relation(fields: [characterId], references: [id])

  profession    Profession
  level         Int       @default(1)
  experience    Int       @default(0)

  @@unique([characterId, profession])
}

model Recipe {
  id            Int       @id @default(autoincrement())
  profession    Profession
  name          String
  description   String

  requiredLevel Int

  // Ресурсы для крафта (JSON)
  materials     Json      // [{itemId: 1, quantity: 5}, ...]
  gold          Int

  // Результат крафта
  resultItemId  Int?
  resultItem    Item?     @relation(fields: [resultItemId], references: [id])

  craftedItems  CraftedItem[]
}

model CraftedItem {
  id            Int       @id @default(autoincrement())
  recipeId      Int
  recipe        Recipe    @relation(fields: [recipeId], references: [id])

  characterId   Int
  character     Character @relation(fields: [characterId], references: [id])

  craftedAt     DateTime  @default(now())
}
```

#### ProfessionModule
- **ProfessionService**:
  - `learnProfession(characterId, profession)` - изучить профессию (макс 2)
  - `getRecipes(profession, level)` - доступные рецепты
  - `craftItem(characterId, recipeId)` - скрафтить предмет
  - `gainProfessionExp(characterId, profession, exp)` - опыт профессии

- **ProfessionController**:
  - GET `/professions` - список всех профессий
  - POST `/professions/learn` - изучить профессию
  - GET `/professions/:profession/recipes` - рецепты
  - POST `/professions/craft` - крафт предмета

#### Seed рецептов (по 10 на профессию)

**Blacksmith:**
- Iron Sword (+10 dmg, lvl 1)
- Steel Armor (+15 armor, lvl 3)
- Titanium Weapon (+25 dmg, lvl 5)

**Alchemist:**
- Minor Health Potion (+20% HP, lvl 1)
- Stamina Potion (+20 stamina, lvl 2)
- Elixir of Strength (+10 STR на 5 боев, lvl 4)

**Enchanter:**
- Basic Enchantment (+5% урона, lvl 1)
- Magic Resistance (+10% защита от магии, lvl 3)
- Life Steal (+5% вампиризма, lvl 5)

### Frontend

#### Страницы
- `ProfessionsPage` - выбор и изучение профессий
- `CraftingPage` - список рецептов и крафт
- `RecipeCard` - карточка рецепта с материалами

#### UI
- Иконки профессий
- Прогресс-бар уровня профессии
- Список материалов для крафта
- Кнопка крафта (проверка ресурсов)

---

## 4. СИСТЕМА ДОСТИЖЕНИЙ

### Backend

#### Prisma Schema
```prisma
enum AchievementType {
  COMBAT      // боевые достижения
  PROGRESSION // прогрессия персонажа
  COLLECTION  // коллекционирование
  SOCIAL      // социальные
}

model Achievement {
  id            Int       @id @default(autoincrement())
  type          AchievementType
  name          String
  description   String
  icon          String?

  // Условия выполнения (JSON)
  requirements  Json      // {type: "kills", target: 100}

  // Награды (JSON)
  rewards       Json      // {gold: 500, exp: 1000, title: "Monster Slayer"}

  characterAchievements CharacterAchievement[]
}

model CharacterAchievement {
  id            Int       @id @default(autoincrement())
  characterId   Int
  character     Character @relation(fields: [characterId], references: [id])

  achievementId Int
  achievement   Achievement @relation(fields: [achievementId], references: [id])

  progress      Int       @default(0)
  completed     Boolean   @default(false)
  completedAt   DateTime?

  @@unique([characterId, achievementId])
}
```

#### AchievementModule
- **AchievementService**:
  - `checkAchievements(characterId, event)` - проверка после событий
  - `getCharacterAchievements(characterId)` - достижения персонажа
  - `claimReward(characterId, achievementId)` - получить награду

- **AchievementController**:
  - GET `/achievements` - все достижения
  - GET `/achievements/character/:characterId` - достижения персонажа
  - POST `/achievements/claim` - забрать награду

#### Seed достижений (30 штук)

**Combat:**
- First Blood (первое убийство)
- Monster Hunter (100 убийств)
- Boss Slayer (10 боссов)
- PvP Warrior (10 PvP побед)
- Unstoppable (5 побед подряд)

**Progression:**
- Apprentice (уровень 5)
- Expert (уровень 10)
- Master (уровень 20)
- Rich (10000 золота)
- Fully Equipped (все слоты с epic+)

**Collection:**
- Collector (50 предметов)
- Blacksmith's Friend (заточка +10)
- Skill Master (все навыки изучены)

### Frontend

#### Компоненты
- `AchievementsPage` - страница достижений
- `AchievementCard` - карточка достижения
- `ProgressBar` - прогресс выполнения
- `RewardBadge` - значок награды

#### UI
- Сетка достижений
- Фильтр по типу
- Анимация при разблокировке
- Уведомление о новом достижении (toast)

---

## 5. PVP СИСТЕМА

### Backend

#### Обновление Prisma Schema
```prisma
enum BattleType {
  PVE
  PVP
}

model Battle {
  // ... существующие поля
  type          BattleType @default(PVE)

  // PvP поля
  player1Id     Int?
  player1       Character? @relation("Player1", fields: [player1Id], references: [id])

  player2Id     Int?
  player2       Character? @relation("Player2", fields: [player2Id], references: [id])

  winnerId      Int?
  winner        Character? @relation("Winner", fields: [winnerId], references: [id])

  ratingChange  Int?      // изменение рейтинга
}

model PvPQueue {
  id            Int       @id @default(autoincrement())
  characterId   Int       @unique
  character     Character @relation(fields: [characterId], references: [id])

  rating        Int
  joinedAt      DateTime  @default(now())
}
```

#### PvPModule
- **PvPService**:
  - `joinQueue(characterId)` - войти в очередь
  - `leaveQueue(characterId)` - выйти из очереди
  - `findMatch()` - найти противника (±100 рейтинга)
  - `startPvPBattle(player1Id, player2Id)` - создать PvP бой
  - `endPvPBattle(battleId, winnerId)` - завершить с изменением рейтинга

- **PvPGateway** (WebSocket):
  - `queue:join` - присоединиться к очереди
  - `queue:leave` - покинуть очередь
  - `match:found` - матч найден
  - `battle:action` - ход в реальном времени
  - `battle:end` - конец боя

#### Формула рейтинга (ELO-like)
```typescript
const K = 30;
const expectedScore = 1 / (1 + 10 ** ((opponentRating - myRating) / 400));
const newRating = myRating + K * (actualScore - expectedScore);
```

### Frontend

#### Компоненты
- `PvPQueuePage` - страница очереди
- `MatchmakingTimer` - таймер поиска
- `PvPBattleArena` - боевая арена для PvP
- `RatingDisplay` - отображение рейтинга
- `OpponentCard` - карточка противника

#### UI
- Кнопка "Найти бой"
- Таймер поиска (30 сек)
- Анимация при нахождении противника
- Таймер хода (10 сек)
- Отображение рейтинга обоих игроков

---

## 6. СИСТЕМА ЛИГ (Arena Leagues)

### Backend

#### Prisma Schema
```prisma
enum League {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
  MASTER
}

model CharacterLeague {
  id            Int       @id @default(autoincrement())
  characterId   Int       @unique
  character     Character @relation(fields: [characterId], references: [id])

  league        League    @default(BRONZE)
  division      Int       @default(5)  // 5, 4, 3, 2, 1 (5 - низший)

  leaguePoints  Int       @default(0)  // 0-100 для продвижения

  wins          Int       @default(0)
  losses        Int       @default(0)
  winStreak     Int       @default(0)

  seasonId      Int?
  season        Season?   @relation(fields: [seasonId], references: [id])

  updatedAt     DateTime  @updatedAt
}

model Season {
  id            Int       @id @default(autoincrement())
  name          String    // "Season 1"
  startDate     DateTime
  endDate       DateTime
  active        Boolean   @default(true)

  characterLeagues CharacterLeague[]
  rewards       Json      // награды за сезон по лигам
}
```

#### LeagueModule
- **LeagueService**:
  - `getCharacterLeague(characterId)` - текущая лига
  - `updateLeague(characterId, won)` - обновить после боя
  - `promoteToNextDivision()` - повышение дивизиона
  - `demoteToLowerDivision()` - понижение дивизиона
  - `getLeagueLeaderboard(league, division)` - топ лиги

- **LeagueController**:
  - GET `/leagues/character/:characterId` - лига персонажа
  - GET `/leagues/:league/leaderboard` - топ лиги
  - GET `/leagues/seasons/current` - текущий сезон

#### Правила лиг
- **Получение LP (League Points):**
  - Победа: +20 LP (+5 за win streak >3)
  - Поражение: -15 LP

- **Продвижение:**
  - 100 LP → повышение дивизиона
  - Division 1 + 100 LP → повышение лиги

- **Понижение:**
  - 0 LP + поражение → понижение дивизиона

### Frontend

#### Компоненты
- `LeaguePage` - страница лиги
- `LeagueBadge` - значок лиги
- `LeagueProgress` - прогресс LP
- `LeagueLeaderboard` - топ лиги
- `SeasonInfo` - информация о сезоне

#### UI
- Большой значок лиги в центре
- Прогресс-бар LP (0-100)
- Статистика побед/поражений
- Топ-20 игроков лиги
- Награды за сезон

---

## ПОРЯДОК РЕАЛИЗАЦИИ

### Неделя 1: Древо навыков + Способности
1. День 1-2: Backend (Prisma, SkillModule, AbilityModule)
2. День 3: Seed навыков и способностей
3. День 4-5: Frontend (SkillTreePage, AbilityButton)
4. День 6: Интеграция и тестирование

### Неделя 2: Профессии + Достижения
1. День 1-2: Backend (ProfessionModule, AchievementModule)
2. День 3: Seed рецептов и достижений
3. День 4-5: Frontend (CraftingPage, AchievementsPage)
4. День 6: Интеграция и тестирование

### Неделя 3: PVP + Лиги
1. День 1-3: Backend (PvPModule, LeagueModule, WebSocket)
2. День 4-5: Frontend (PvPQueuePage, LeaguePage)
3. День 6-7: Баланс, тестирование, багфиксы

---

## ТЕХНИЧЕСКИЕ ДЕТАЛИ

### Обновление Character entity
```typescript
character {
  // ... существующие поля

  // Навыки
  skills: CharacterSkill[]
  skillPoints: number

  // Профессии
  professions: CharacterProfession[]

  // Достижения
  achievements: CharacterAchievement[]

  // PvP
  rating: number
  league: CharacterLeague
  pvpWins: number
  pvpLosses: number
}
```

### API Endpoints (новые)
```
Skills:
  GET    /skills/tree/:class
  GET    /skills/character/:characterId
  POST   /skills/learn
  POST   /skills/upgrade

Abilities:
  POST   /battle/:battleId/ability

Professions:
  GET    /professions
  POST   /professions/learn
  GET    /professions/:profession/recipes
  POST   /professions/craft

Achievements:
  GET    /achievements
  GET    /achievements/character/:characterId
  POST   /achievements/claim

PvP:
  POST   /pvp/queue/join
  POST   /pvp/queue/leave
  WebSocket events: queue:*, match:*, battle:*

Leagues:
  GET    /leagues/character/:characterId
  GET    /leagues/:league/leaderboard
  GET    /leagues/seasons/current
```

---

## МЕТРИКИ УСПЕХА

### Технические:
- ✅ Все эндпоинты работают без ошибок
- ✅ PvP матчи проходят в реальном времени
- ✅ Правильный расчет рейтинга и LP
- ✅ Корректное применение навыков и способностей

### Игровые:
- ✅ Баланс навыков (ни один класс не доминирует)
- ✅ Профессии дают преимущество
- ✅ Достижения мотивируют игроков
- ✅ PvP матчи находятся за <30 секунд

### UX:
- ✅ Интуитивное древо навыков
- ✅ Понятная система лиг
- ✅ Визуальная обратная связь на все действия
