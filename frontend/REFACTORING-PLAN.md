# 🎯 ПЛАН РЕФАКТОРИНГА - БЫСТРО И БЕЗОПАСНО

## 📌 ЦЕЛЬ
Подготовить чистую рабочую версию для команды:
- ❌ Убрать весь мусор и дубли
- ✅ Оставить только рабочий код
- 🔒 НЕ ломать текущую функциональность
- 🎨 НЕ трогать верстку (inline стили остаются!)
- ⏱️ Сроки: 2-3 часа максимум

---

## 🚀 ШАГ 1: БЕЗОПАСНАЯ ОЧИСТКА (30-40 минут)

### 1.1 Удаление ПОЛНОСТЬЮ безопасных файлов
**Что удаляем:**
```
frontend/src/figmareference/          - ВСЯ ПАПКА (10000+ строк)
frontend/src/App.tsx                  - не используется в роутинге
frontend/src/components/ChatWindow.old.tsx
frontend/src/pages/Login.tsx          - заменен на pages/login/LoginPage.tsx
frontend/src/pages/CreateCharacter.tsx - заменен на pages/createCharacter/
frontend/src/hooks/useTelegramWebApp.ts
frontend/src/services/auth.service.ts
frontend/src/styles/common.styles.ts
frontend/src/components/GameViewport.tsx
```

**Как проверить:**
1. Удалить файл/папку
2. `npm run dev` - проверить что компилируется
3. Открыть браузер - проверить что работает
4. Коммит: "cleanup: remove unused files - step 1"

**Если что-то сломалось:**
- `git restore <file>` - вернуть файл
- Пропустить этот файл

---

## 🔧 ШАГ 2: БЫСТРЫЕ ФИКСЫ (20-30 минут)

### 2.1 API - убрать дубль
**Файл:** `frontend/src/store/api/characterApi.ts`

```typescript
// БЫЛО:
getMyCharacter: builder.query<Character[], void>({
  query: () => `/character/me`,
}),
getMyCharacters: builder.query<Character[], void>({
  query: () => `/character/my-characters`,
}),

// СТАЛО:
getMyCharacters: builder.query<Character[], void>({
  query: () => `/character/my-characters`,
  providesTags: ['Character'],
}),
// getMyCharacter УДАЛИТЬ
```

**Замена использований:**
```bash
# Найти все использования:
grep -r "useGetMyCharacterQuery" frontend/src/

# В найденных файлах заменить:
useGetMyCharacterQuery → useGetMyCharactersQuery
```

**Проверка:**
- Dashboard работает
- ChooseHero работает
- Коммит: "refactor: unify character API queries"

### 2.2 Удалить неиспользуемый API метод
**Файл:** `frontend/src/store/api/authApi.ts`

Удалить:
```typescript
checkAuth: builder.query<{ user: User }, void>({
  query: () => '/auth/me',
}),
```

**Проверка:**
- `npm run dev` компилируется
- Коммит: "cleanup: remove unused checkAuth query"

---

## 📁 ШАГ 3: СТРУКТУРА ПАПОК (15-20 минут)

### 3.1 Переименовать страницы (опционально)
**Текущая структура:**
```
pages/
  login/LoginPage.tsx          ✅
  login/RegisterPage.tsx       ✅
  chooseHero/ChooseHeroPage.tsx ✅
  createCharacter/CreateCharacterPage.tsx ✅
  Dashboard.tsx                ❌ (не в папке)
  Dungeon.tsx                  ❌
  PvP.tsx                      ❌
  ...
```

**ЕСЛИ ЕСТЬ ВРЕМЯ:**
Создать папки для оставшихся страниц:
```
pages/dashboard/DashboardPage.tsx
pages/dungeon/DungeonPage.tsx
pages/pvp/PvPPage.tsx
```

**Но это НИЗКИЙ приоритет!** Можно оставить как есть.

---

## 🧪 ШАГ 4: ТЕСТИРОВАНИЕ (30 минут)

### 4.1 Проверить весь флоу
✅ Landing → Login
✅ Login → Choose Hero
✅ Choose Hero → Create Character
✅ Create Character → Dashboard
✅ Dashboard: все секции работают
✅ Dungeon: выбор сложности + бой
✅ PvP: работает
✅ Inventory: drag & drop
✅ Forge: заточка работает
✅ Chat: отправка сообщений

### 4.2 Проверить что НЕ сломалось
✅ Музыка выключена по умолчанию
✅ localStorage работает (characterId, auth)
✅ Стили выглядят как раньше
✅ WebSocket чата работает
✅ WebSocket боя работает

---

## 📝 ШАГ 5: ДОКУМЕНТАЦИЯ (10 минут)

### 5.1 Обновить README
Создать `frontend/STRUCTURE.md`:
```markdown
# Структура Frontend

## Папки
- `/pages/login/` - Авторизация (Login + Register)
- `/pages/chooseHero/` - Выбор персонажа
- `/pages/createCharacter/` - Создание персонажа
- `/pages/` - Основные страницы (Dashboard, Dungeon, PvP, etc)
- `/components/` - Общие компоненты
- `/components/dashboard/` - Компоненты Dashboard
- `/store/api/` - RTK Query API
- `/hooks/` - Custom hooks
- `/utils/` - Утилиты

## API
- `authApi.ts` - Авторизация
- `characterApi.ts` - Персонажи
- `inventoryApi.ts` - Инвентарь
- `enhancementApi.ts` - Заточка

## Роутинг
- `/` - Landing
- `/login` - Вход
- `/register` - Регистрация
- `/choose-hero` - Выбор героя (protected)
- `/create-character` - Создание (protected)
- `/dashboard` - Главная (protected)
- `/dungeon` - Подземелье (protected)
- `/pvp` - PvP (protected)
```

---

## ✅ ИТОГОВЫЙ ЧЕКЛИСТ

### Что ДЕЛАЕМ:
- [x] Удаляем figmareference/ (10000 строк)
- [x] Удаляем старые дубли (Login.tsx, CreateCharacter.tsx, ChatWindow.old.tsx)
- [x] Удаляем неиспользуемые файлы (App.tsx, auth.service.ts, etc)
- [x] Объединяем API методы (getMyCharacter → getMyCharacters)
- [x] Удаляем неиспользуемые API (checkAuth)
- [x] Тестируем весь флоу
- [x] Документируем структуру

### Что НЕ ДЕЛАЕМ (оставляем на потом):
- ❌ НЕ переписываем стили (Dashboard inline стили остаются)
- ❌ НЕ разбиваем God components (Dashboard 603 строки - пусть живет)
- ❌ НЕ выносим музыку в Context (пока работает - не трогаем)
- ❌ НЕ централизуем localStorage (работает - значит ОК)
- ❌ НЕ убираем props drilling (функционал важнее)
- ❌ НЕ переименовываем файлы страниц (можно оставить Dashboard.tsx)

---

## 🎯 РЕЗУЛЬТАТ

**Что получим:**
✅ ~15000 строк удаленного мусора
✅ Нет дублей компонентов
✅ Чистая структура файлов
✅ Единое API без дублей
✅ Работающая версия БЕЗ изменений в UI
✅ Задокументированная структура

**Время:** 2-3 часа
**Риск поломки:** МИНИМАЛЬНЫЙ (удаляем только неиспользуемое)
**Готово для команды:** ДА!

---

## 🔄 ПОРЯДОК ВЫПОЛНЕНИЯ

```bash
# 1. ОЧИСТКА
git checkout -b refactor/cleanup
rm -rf frontend/src/figmareference
rm frontend/src/App.tsx
rm frontend/src/components/ChatWindow.old.tsx
rm frontend/src/pages/Login.tsx
rm frontend/src/pages/CreateCharacter.tsx
rm frontend/src/hooks/useTelegramWebApp.ts
rm frontend/src/services/auth.service.ts
rm frontend/src/styles/common.styles.ts
git add -A
git commit -m "cleanup: remove unused files and duplicates"

# Проверка
npm run dev
# Открыть браузер - проверить что работает

# 2. API ФИКСЫ
# Править characterApi.ts
# Заменить useGetMyCharacterQuery на useGetMyCharactersQuery
git add -A
git commit -m "refactor: unify character API queries"

# Удалить checkAuth из authApi.ts
git add -A
git commit -m "cleanup: remove unused checkAuth query"

# 3. ТЕСТИРОВАНИЕ
# Проверить весь флоу от Landing до Dashboard

# 4. ДОКУМЕНТАЦИЯ
# Создать STRUCTURE.md
git add -A
git commit -m "docs: add frontend structure documentation"

# 5. ПУШ
git push origin refactor/cleanup
```

---

## ⚠️ ЕСЛИ ЧТО-ТО СЛОМАЛОСЬ

```bash
# Откатить последний коммит
git reset --soft HEAD~1

# Или вернуть конкретный файл
git restore <file>

# Или откатить всю ветку
git checkout main
git branch -D refactor/cleanup
```

**ГЛАВНОЕ ПРАВИЛО:**
Коммитим КАЖДЫЙ шаг отдельно → легко откатить если что!

---

## 💡 ПОСЛЕ РЕФАКТОРИНГА

Когда команда получит код, можно планировать СЛЕДУЮЩИЙ этап:
1. Разбить God components (Dashboard, Dungeon, Inventory)
2. Вынести музыку в Context
3. Централизовать localStorage
4. Унифицировать стили

Но это уже ПОСЛЕ того как текущая версия стабильно работает у всех!
