# EPIC 4 - План реализации

## НЕДЕЛЯ 1: Специализации + Базовые способности

### День 1-2: Backend (Специализации)
**Prisma Schema:**
- Таблица Specialization (characterId, class, branch, tier1/2/3)
- Таблица SpecializationAbility (tier, name, effects JSON)

**SpecializationModule:**
- Service: getAvailableBranches(), chooseBranch(), unlockTier(), getBranchAbilities()
- Controller: GET /specs/:class, POST /specs/choose, POST /specs/unlock

**Seed данных:**
- 6 веток × 3 тира = 18 способностей
- Warrior: Paladin, Barbarian
- Rogue: Shadow Dancer, Poisoner
- Mage: Frost Mage, Warlock

### День 3: Backend (Базовые способности)
**Обновление BattleService:**
- Метод useClassAbility(battleId, abilityName)
- Проверка кулдаунов (1 раз за бой)
- Применение эффектов (Rage, Stealth, Super Mind)

**Таблица AbilityUsage:**
- battleId, characterId, abilityName, usedAt

### День 4-5: Frontend (Специализации)
**Компоненты:**
- SpecializationSelectPage (выбор ветки на lvl 10)
- BranchCard (карточка ветки с описанием)
- TierProgressBar (прогресс открытия тиров)

**Интеграция:**
- specializationApi (RTK Query)
- Выбор ветки → смена ассета персонажа

### День 6: Frontend (Способности в бою)
**Компоненты:**
- AbilityButton (кнопки Tier 2/3 в бою)
- CooldownTimer (круговой таймер кулдауна)
- ClassAbilityButton (базовая способность класса)

**Визуализация:**
- Анимация использования способности
- Активные эффекты над HP баром

### День 7: Тестирование
- Проверка выбора веток
- Тест способностей в PvE боях
- Проверка кулдаунов
- Баланс тестирование

---

## НЕДЕЛЯ 2: Профессии + Кристаллы + Достижения

### День 1-2: Backend (Профессии)
**Prisma Schema:**
- CharacterProfession (profession, level, experience)
- Recipe (profession, materials JSON, resultItemId)
- CraftedItem (recipeId, characterId)

**ProfessionModule:**
- Service: learnProfession(), craft(), gainExp()
- Controller: GET /professions, POST /professions/learn, POST /professions/craft

**Seed рецептов:**
- Blacksmith: 10 рецептов (оружие, броня)
- Alchemist: 10 рецептов (зелья)
- Enchanter: 10 рецептов (зачарования)

### День 3: Backend (Кристаллы)
**Обновление Item Schema:**
- Поле sockets: Int (0-3, генерится при дропе)
- Таблица ItemSocket (itemId, socketIndex, crystalId)
- Таблица Crystal (type: HP/STR/INT, bonus: Int)

**Обновление LootService:**
- Генерация сокетов при дропе предмета
- Дроп кристаллов с боссов (30% шанс)

**EnchantModule:**
- Service: insertCrystal(itemId, crystalId, socketIndex)
- Controller: POST /items/:itemId/socket/insert

### День 4: Backend (Достижения)
**Prisma Schema:**
- Achievement (type, name, requirements JSON, rewards JSON)
- CharacterAchievement (achievementId, progress, completed)

**AchievementModule:**
- Service: checkAchievements(), claimReward()
- Controller: GET /achievements, POST /achievements/claim

**Seed достижений:**
- 30 достижений (10 Combat, 10 Progression, 10 Collection)

**Интеграция:**
- Хуки в BattleService, CharacterService, InventoryService
- Проверка достижений после событий

### День 5-6: Frontend (Профессии + Кристаллы)
**Компоненты:**
- ProfessionsPage (список профессий, выбор)
- CraftingPage (рецепты, материалы, кнопка крафта)
- ProfessionLevelBar (уровень профессии 1-3)
- EnchantPage (инкрустация кристаллов)
- SocketSlot (слот для кристалла)
- CrystalCard (карточка кристалла)

**Интеграция:**
- professionApi, enchantApi (RTK Query)
- Обновление инвентаря после крафта

### День 7: Frontend (Достижения)
**Компоненты:**
- AchievementsPage (сетка достижений)
- AchievementCard (прогресс, награда)
- AchievementToast (уведомление о разблокировке)

**Интеграция:**
- achievementApi (RTK Query)
- WebSocket подписка на разблокировку

---

## НЕДЕЛЯ 3: PVP + Лиги

### День 1-2: Backend (PVP)
**Обновление Prisma Schema:**
- Battle.type = PVE | PVP
- PvPQueue (characterId, rating, joinedAt)
- Battle.player1Id, player2Id, winnerId

**PvPModule:**
- Service: joinQueue(), findMatch(), startPvPBattle(), endBattle()
- Gateway (WebSocket): queue:join, match:found, battle:action, battle:end

**Matchmaking:**
- Cron job каждые 5 сек
- Поиск противника ±100 рейтинга
- Создание PvP боя

**ELO рейтинг:**
- Формула расчета изменения рейтинга
- Обновление после боя

### День 3: Backend (Лиги)
**Prisma Schema:**
- CharacterLeague (league, division, leaguePoints, wins, losses, streak)
- Season (name, startDate, endDate, active)

**LeagueModule:**
- Service: updateLeague(won), promoteDiv(), demoteDiv()
- Controller: GET /leagues/character/:id, GET /leagues/:league/leaderboard

**Механика:**
- Победа: +20 LP (+5 за streak >3)
- Поражение: -35 LP
- 100 LP → повышение
- 0 LP + поражение → понижение

### День 4-5: Frontend (PVP)
**Компоненты:**
- PvPQueuePage (кнопка "Найти бой", таймер)
- MatchFoundModal (противник найден)
- PvPBattleArena (боевая арена real-time)
- TurnTimer (таймер хода 10 сек)
- OpponentCard (карточка противника)

**WebSocket интеграция:**
- Подключение к PvP gateway
- События: queue:join, match:found, battle:action, battle:end
- Синхронизация состояния боя

### День 6: Frontend (Лиги)
**Компоненты:**
- LeaguePage (значок лиги, прогресс LP)
- LeagueBadge (значок лиги + дивизион)
- LPProgressBar (0-100, анимация)
- LeagueLeaderboard (топ-20)
- WinLossStats (статистика)
- SeasonInfo (текущий сезон)

**Интеграция:**
- leagueApi (RTK Query)
- Обновление после каждого PvP боя

### День 7: Тестирование + Баланс
- Тест PvP матчей (2 окна браузера)
- Проверка синхронизации
- Тест таймеров
- Баланс специализаций
- Проверка лиг и LP
- Багфиксы

---

## КРИТИЧЕСКИЕ ТОЧКИ

### Специализации:
- Выбор ветки ОДИН РАЗ (можно поменять за золото)
- Смена ассета персонажа
- Tier 1 → новый слот экипировки

### PVP:
- Real-time синхронизация через WebSocket
- Обработка дисконнектов
- Таймеры ходов (10 сек)

### Лиги:
- Правильный расчет LP
- Понижение/повышение дивизионов
- Сброс сезона

---

## ТЕХНОЛОГИИ

### Backend (новое):
- WebSocket Gateway (PvP)
- Cron Jobs (matchmaking)
- JSON поля (effects, requirements, rewards)

### Frontend (новое):
- Socket.io-client (PvP)
- Framer Motion (анимации способностей)
- React Context (PvP состояние)

---

## МЕТРИКИ УСПЕХА

### Технические:
- ✅ PvP матч находится за <30 сек
- ✅ Задержка хода <500ms
- ✅ Все способности работают корректно
- ✅ LP начисляется правильно

### Игровые:
- ✅ Баланс веток (win rate 45-55%)
- ✅ Профессии дают ощутимое преимущество
- ✅ Достижения мотивируют
- ✅ PvP захватывает

---

## ПОРЯДОК ЗАПУСКА

1. **Неделя 1:** Специализации → можно тестировать в PvE
2. **Неделя 2:** Профессии → можно крафтить, Достижения → начинают разблокироваться
3. **Неделя 3:** PVP → полноценный real-time режим, Лиги → соревновательный элемент

**ИТОГО: 3 недели = полный EPIC 4** 🚀
