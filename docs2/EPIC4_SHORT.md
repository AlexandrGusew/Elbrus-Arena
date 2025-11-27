# EPIC 4 - Краткий план

## 1. ДРЕВО НАВЫКОВ (Специализации)

### Backend
- Таблица: Specialization (ветка, tier1/2/3)
- API: GET /specs/:class, POST /specs/choose, POST /specs/unlock-tier
- Выбор на уровне 10, открытие тиров: 10 → 15 → 20
- Смена ветки за золото

### WARRIOR - 2 ветки
**Paladin:** Tier 1 щит → Tier 2 +10% защита (1 ход) → Tier 3 неуязвимость + отражение 50%
**Barbarian:** Tier 1 два оружия → Tier 2 +10% атака (1 ход) → Tier 3 вампиризм 20% + 25% урона (2 хода)

### ROGUE - 2 ветки
**Shadow Dancer:** Tier 1 удар в спину (5 зон) → Tier 2 +15% уворот (2 хода) → Tier 3 клон (×2 урон, 2 хода)
**Poisoner:** Tier 1 яд (+10% урон, 2 хода) → Tier 2 усиление ядов (+20%, 3 хода) → Tier 3 смертельный яд (50% урон, 3 хода, стак)

### MAGE - 2 ветки
**Frost Mage:** Tier 1 элементаль (1 атака/ход) → Tier 2 ледяная броня (враг не защищается, 1 ход) → Tier 3 заморозка + крит ×3
**Warlock:** Tier 1 бес (страх, враг 2 защиты из 4) → Tier 2 темный пакт (-10% HP, +30% урон, 2 хода) → Tier 3 демон (2 атаки/ход, 3 хода)

### Frontend
- SpecializationPage (выбор ветки на lvl 10, меняет ассет)
- AbilityButtons в бою (Tier 2/3 с кулдаунами)

---

## 2. СПОСОБНОСТИ КЛАССОВ (базовые)

### Backend
- Таблицы: ClassAbility, CharacterAbilityUsage
- POST /battle/:battleId/ability

### Способности (1 раз за бой)
**Warrior "Rage":** +15% сила (2 хода), откат -5% (1 ход)
**Rogue "Stealth":** +30% уворот (2 хода), откат следующий удар крит
**Mage "Super Mind":** +1 атака (2 хода), откат пропуск хода

---

## 3. ПРОФЕССИИ

### Backend
- Таблицы: CharacterProfession (level 1-3), Recipe, CraftedItem
- API: GET /professions, POST /professions/learn (макс 2), POST /professions/craft
- Опыт: +1 за каждый крафт/заточку/зачарование

### Профессии
**Blacksmith:**
- Lvl 1: +5% шанс заточки
- Lvl 2: +10% шанс
- Lvl 3: +15% шанс
- Рецепты: Iron Sword, Steel Armor, Titanium Weapon

**Alchemist:**
- Lvl 1: +10% эффект зелий
- Lvl 2: +30% эффект
- Lvl 3: 2 зелья за использование
- Рецепты: Health Potion, Stamina Potion, Elixir of Strength

**Enchanter:**
- Lvl 1: +5% шанс инкрустации кристаллов
- Lvl 2: +10% шанс
- Lvl 3: +15% шанс
- Рецепты: Basic Enchantment (+5% урон), Magic Resistance, Life Steal

### Инкрустация кристаллов
- Предметы дропаются с 0-3 сокетами (рандом)
- Кристаллы дропают только с боссов
- Типы: Здоровье, Сила, Интеллект
- Базовый шанс вставки кристалла (улучшается Enchanter)

### Frontend
- ProfessionsPage (выбор профессии)
- CraftingPage (рецепты, материалы)
- EnchantPage (инкрустация кристаллов в сокеты)

---

## 4. ДОСТИЖЕНИЯ

### Backend
- Таблицы: Achievement, CharacterAchievement (progress, completed)
- API: GET /achievements, POST /achievements/claim
- 30 достижений (Combat, Progression, Collection)

### Примеры
**Combat:** First Blood, Monster Hunter (100), Boss Slayer (10), PvP Warrior (10)
**Progression:** Apprentice (lvl 5), Expert (10), Master (20), Rich (10k)
**Collection:** Collector (50 предметов), Blacksmith's Friend (+10)

### Frontend
- AchievementsPage (сетка, фильтр, прогресс-бар)
- Toast уведомления при разблокировке

---

## 5. PVP

### Backend
- Таблицы: Battle (type: PVE/PVP), PvPQueue
- WebSocket: queue:join, match:found, battle:action, battle:end
- Matchmaking: ±100 рейтинга
- ELO формула рейтинга

### Правила
- Таймер поиска: 30 сек
- Таймер хода: 10 сек
- Рейтинг: победа +15, поражение -30

### Frontend
- PvPQueuePage (кнопка, таймер поиска)
- PvPBattleArena (real-time через WebSocket)
- Рейтинг обоих игроков

---

## 6. ЛИГИ

### Backend
- Таблицы: CharacterLeague, Season
- API: GET /leagues/character/:id, GET /leagues/:league/leaderboard
- 6 лиг: Bronze → Silver → Gold → Platinum → Diamond → Master
- 5 дивизионов в каждой (5, 4, 3, 2, 1)

### Механика LP (League Points)
- Победа: +20 LP (+5 за streak >3)
- Поражение: -35 LP
- 100 LP = повышение дивизиона
- Division 1 + 100 LP = повышение лиги

### Frontend
- LeaguePage (значок лиги, прогресс LP 0-100)
- LeagueLeaderboard (топ-20)
- Статистика побед/поражений

---

## ПОРЯДОК РЕАЛИЗАЦИИ

**Неделя 1:** Специализации (древо навыков) + Базовые способности
**Неделя 2:** Профессии + Кристаллы + Достижения
**Неделя 3:** PVP + Лиги

---

## НОВЫЕ API

```
# Специализации
GET    /specializations/:class
POST   /specializations/choose
POST   /specializations/unlock-tier
POST   /battle/:battleId/use-ability/:tier

# Способности
POST   /battle/:battleId/ability

# Профессии
GET    /professions
POST   /professions/learn
POST   /professions/craft
POST   /items/:itemId/socket/insert

# Достижения
GET    /achievements
GET    /achievements/character/:id
POST   /achievements/claim

# PVP
POST   /pvp/queue/join
POST   /pvp/queue/leave
WebSocket: queue:*, match:*, battle:*

# Лиги
GET    /leagues/character/:id
GET    /leagues/:league/leaderboard
GET    /leagues/seasons/current
```

---

## КЛЮЧЕВЫЕ ЧИСЛА

- **6 специализаций** (по 2 на класс)
- **3 тира** (10, 15, 20 уровни)
- **3 профессии** (макс 2 на персонажа)
- **3 уровня профессии** (+1 опыт за крафт)
- **0-3 сокета** в предметах (рандом дроп)
- **3 типа кристаллов** (дроп с боссов)
- **30 достижений** (Combat/Progression/Collection)
- **6 лиг × 5 дивизионов** = 30 рангов
- **±100 рейтинга** для matchmaking
- **10 сек** на ход в PVP
