# 📋 ПРОМТ: Пошаговый план миграции Dashboard на новую структуру

## ЦЕЛЬ:
Переработать текущий `Dashboard.tsx` под новую структуру из Figma, интегрировав компоненты Inventory и Forge внутрь дашборда вместо отдельных страниц-роутов.

---

## Анализ различий между текущим и новым дашбордом

### Текущий Dashboard.tsx:
- **Стиль**: Инлайн стили, абсолютное позиционирование
- **Структура**: Видео фон + навигационные кнопки-ссылки (2x3 сетка слева)
- **Навигация**: React Router Links на отдельные страницы (/inventory, /blacksmith, /dungeon и т.д.)
- **Компоненты**: CharacterSelector справа, ChatWindow модальное окно
- **Размеры**: Фиксированный контейнер 1366x768px

### Новый DashboardPage.tsx (Figma):
- **Стиль**: Tailwind CSS с темной фэнтези темой
- **Структура**: Двухколоночный grid (45% / 55%)
  - **Левая колонка**:
    - Верх (66%): Карточка персонажа ИЛИ ForgeSection
    - Низ (33%): Чат с табами
  - **Правая колонка**:
    - По умолчанию: 4 кнопки (Arena, Dange, Inventory, Forge)
    - При клике на Inventory: показывает InventorySection
- **Навигация**: Встроенные компоненты с переключением через state (activeSection, showForge)
- **Декоративные элементы**: Красные уголки на всех панелях

### Ключевые компоненты:

**InventorySection**:
- Табы навигации между Inventory ↔ Forge
- Карточка выбранного предмета (изображение + характеристики)
- Сетка инвентаря 4x3 (12 слотов)

**ForgeSection**:
- 2 слота: предмет + свиток улучшения
- Кнопка Upgrade
- История улучшений

---

## ШАГ 1: Подготовка - настройка Tailwind CSS

**Действия:**
1. Проверить, настроен ли Tailwind в основном проекте (`Elbrus-Arena/frontend/`)
2. Если нет - скопировать конфигурацию из `figmareference`:
   - `tailwind.config.js`
   - `postcss.config.js`
   - Добавить импорты Tailwind в главный CSS файл

**Проверка:**
```bash
cd Elbrus-Arena/frontend
npm list tailwindcss
```

**Если не установлен:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Добавить в `src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## ШАГ 2: Создание новых компонентов в основном проекте

### 2.1 Создать папку для компонентов дашборда
```bash
mkdir -p Elbrus-Arena/frontend/src/components/dashboard
```

### 2.2 Создать InventorySection.tsx

**Файл:** `Elbrus-Arena/frontend/src/components/dashboard/InventorySection.tsx`

**Действия:**
1. Скопировать код из `figmareference/src/components/InventorySection.tsx`
2. **Адаптировать под реальные данные**:
   - Заменить моковые данные на props из API
   - Интегрировать с RTK Query для получения инвентаря
   - Добавить типы из `types/api.ts`

**Пример интерфейса:**
```typescript
import { Item } from '../../types/api';

interface InventorySectionProps {
  characterId: number;
  onNavigateToForge?: () => void;
  showForge?: boolean;
  onNavigateToInventory?: () => void;
}
```

### 2.3 Создать ForgeSection.tsx

**Файл:** `Elbrus-Arena/frontend/src/components/dashboard/ForgeSection.tsx`

**Действия:**
1. Скопировать код из `figmareference/src/components/ForgeSection.tsx`
2. **Адаптировать под реальные данные**:
   - Интегрировать с API кузницы (если есть)
   - Добавить логику улучшения предметов
   - История улучшений из бэкенда

**Пример интерфейса:**
```typescript
interface ForgeSectionProps {
  characterId: number;
  onClose?: () => void;
}
```

---

## ШАГ 3: Создание компонента CharacterCard

**Файл:** `Elbrus-Arena/frontend/src/components/dashboard/CharacterCard.tsx`

**Действия:**
1. Создать новый компонент
2. Извлечь логику отображения персонажа из `DashboardPage.tsx` (строки 68-144)
3. **Адаптировать**:
   - Принимать character данные через props (из RTK Query)
   - Показывать реальные характеристики (hitPoint, endurance, damage, armor, str, agi, int)
   - Отображать надетую экипировку из API
   - Добавить взаимодействие с экипировкой (надеть/снять предметы)

**Пример интерфейса:**
```typescript
import { Character } from '../../types/api';

interface CharacterCardProps {
  character: Character;
  onEquipmentClick?: (slotType: string) => void;
}
```

**Структура компонента:**
- Левая половина: Класс, Имя, Аватар персонажа (круг), Уровень
- Правая половина: Статы (верх), Экипировка 2x3 grid (низ)

---

## ШАГ 4: Создание компонента ChatSection

**Файл:** `Elbrus-Arena/frontend/src/components/dashboard/ChatSection.tsx`

**Действия:**
1. Создать новый компонент
2. Извлечь чат-интерфейс из `DashboardPage.tsx` (строки 148-176)
3. **Интегрировать существующий ChatWindow**:
   - Использовать логику из текущего `ChatWindow.tsx`
   - Адаптировать под новый дизайн с табами (All, Private, Banlist, Friendlist)
   - Сохранить WebSocket функционал

**Пример интерфейса:**
```typescript
interface ChatSectionProps {
  characterId: number;
  characterName: string;
}
```

**Функциональность:**
- 4 таба: All, Private, Banlist, Friendlist
- Область сообщений
- Поле ввода
- WebSocket подключение

---

## ШАГ 5: Рефакторинг Dashboard.tsx - структура Layout

**Файл:** `Elbrus-Arena/frontend/src/pages/Dashboard.tsx`

### 5.1 Сохранить существующую функциональность

**Оставить без изменений:**
- Видео фон (mainCityBackground.mp4)
- Музыка с crossfade
- Кнопки управления (Music, Chat, Exit)
- CharacterSelector (справа)
- Загрузка данных через RTK Query
- State management (selectedCharacterId, isMusicPlaying и т.д.)

### 5.2 Добавить новые состояния

```typescript
const [activeSection, setActiveSection] = useState<'main' | 'inventory'>('main');
const [showForge, setShowForge] = useState(false);
```

### 5.3 Заменить основной контент

**БЫЛО:**
```tsx
{/* Навигационные кнопки - сетка 2x3 слева */}
<div style={{ position: 'absolute', left: '10px', ... }}>
  <Link to="/dungeon">...</Link>
  <Link to="/inventory">...</Link>
  <Link to="/blacksmith">...</Link>
  ...
</div>
```

**СТАЛО:**
```tsx
{/* Новая структура - двухколоночный layout */}
<div className="w-full h-full p-4 relative">
  <div className="w-full h-full border-4 border-amber-700/60 rounded-2xl bg-gradient-to-b from-stone-950/95 to-black/95 backdrop-blur-md shadow-2xl shadow-black/80 p-6 relative">
    {/* Corner ornaments */}
    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-red-700/60"></div>
    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-red-700/60"></div>
    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-red-700/60"></div>
    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-red-700/60"></div>

    <div className="grid grid-cols-[45%_55%] gap-6 h-full">
      {/* Левая колонка */}
      <div className="flex flex-col gap-4 h-full">
        {/* Character Info Card OR Forge Section - 2/3 of height */}
        {showForge ? (
          <ForgeSection characterId={character.id} />
        ) : (
          <CharacterCard character={character} />
        )}

        {/* Chat Section - 1/3 of height */}
        <ChatSection
          characterId={character.id}
          characterName={character.name}
        />
      </div>

      {/* Правая колонка */}
      {activeSection === 'main' ? (
        <NavigationButtons
          onInventoryClick={() => setActiveSection('inventory')}
          onForgeClick={() => setShowForge(true)}
        />
      ) : activeSection === 'inventory' ? (
        <InventorySection
          characterId={character.id}
          onNavigateToForge={() => {
            setShowForge(true);
            setActiveSection('main');
          }}
          showForge={showForge}
          onNavigateToInventory={() => setShowForge(false)}
        />
      ) : null}
    </div>
  </div>
</div>
```

---

## ШАГ 6: Создание NavigationButtons компонента

**Файл:** `Elbrus-Arena/frontend/src/components/dashboard/NavigationButtons.tsx`

**Действия:**
1. Создать компонент с 4 кнопками в вертикальной сетке
2. Реализовать навигацию:
   - **Arena** - Link to /pvp (или существующая логика)
   - **Dange** - Link to /dungeon
   - **Inventory** - onClick(() => onInventoryClick()) (ВСТРОЕННЫЙ КОМПОНЕНТ!)
   - **Forge** - onClick(() => onForgeClick())

**Пример кода:**
```tsx
import { Link } from 'react-router-dom';

interface NavigationButtonsProps {
  onInventoryClick: () => void;
  onForgeClick: () => void;
}

export function NavigationButtons({ onInventoryClick, onForgeClick }: NavigationButtonsProps) {
  return (
    <div className="grid grid-rows-4 gap-4 h-full">
      {/* Arena */}
      <Link to="/pvp" className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

        <h3 className="text-3xl uppercase tracking-[0.3em]" style={{
          fontFamily: 'serif',
          textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
          background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Arena</h3>
      </Link>

      {/* Dange */}
      <Link to="/dungeon" className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group">
        {/* ... аналогично ... */}
        <h3>Dange</h3>
      </Link>

      {/* Inventory - встроенный компонент */}
      <div
        onClick={onInventoryClick}
        className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group"
      >
        {/* ... аналогично ... */}
        <h3>Inventory</h3>
      </div>

      {/* Forge */}
      <div
        onClick={onForgeClick}
        className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 flex items-center justify-center relative hover:border-red-700/70 transition-all cursor-pointer group"
      >
        {/* ... аналогично ... */}
        <h3>Forge</h3>
      </div>
    </div>
  );
}
```

---

## ШАГ 7: Стилизация - переход на Tailwind

### 7.1 Заменить инлайн стили на Tailwind классы

**Основной контейнер:**
```tsx
// БЫЛО
<div style={{ position: 'relative', width: '1366px', height: '768px', overflow: 'hidden' }}>

// СТАЛО
<div className="relative w-[1366px] h-[768px] overflow-hidden">
```

### 7.2 Сохранить абсолютное позиционирование для видео фона

```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute top-0 left-0 w-full h-full object-cover z-[1]"
>
  <source src={getAssetUrl('dashboard/mainCityBackground.mp4')} type="video/mp4" />
</video>
```

### 7.3 Декоративные элементы

**Красные уголки на панелях:**
```tsx
{/* Corner ornaments */}
<div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
<div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
<div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
<div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>
```

**Градиенты и тени:**
```tsx
className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 p-4 relative shadow-2xl shadow-black/80"
```

---

## ШАГ 8: Интеграция данных из API

### 8.1 CharacterCard - данные персонажа

**Использовать существующий RTK Query:**
```typescript
const { data: character } = useGetCharacterQuery(selectedCharacterId);
```

**Передать в компонент:**
```tsx
<CharacterCard
  character={character}
  onEquipmentClick={(slotType) => {
    // Логика экипировки
  }}
/>
```

### 8.2 InventorySection - инвентарь

**Создать или использовать существующий API:**
```typescript
// Пример API endpoint
export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<Item[], number>({
      query: (characterId) => `/character/${characterId}/inventory`,
    }),
    equipItem: builder.mutation<void, { characterId: number; itemId: number; slotType: string }>({
      query: ({ characterId, itemId, slotType }) => ({
        url: `/character/${characterId}/equip`,
        method: 'POST',
        body: { itemId, slotType },
      }),
    }),
  }),
});
```

**Использовать в InventorySection:**
```typescript
const { data: inventory } = useGetInventoryQuery(characterId);
const [equipItem] = useEquipItemMutation();
```

### 8.3 ForgeSection - кузница

**API для улучшения предметов:**
```typescript
export const forgeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    upgradeItem: builder.mutation<UpgradeResult, { characterId: number; itemId: number; scrollId: number }>({
      query: ({ characterId, itemId, scrollId }) => ({
        url: `/character/${characterId}/forge/upgrade`,
        method: 'POST',
        body: { itemId, scrollId },
      }),
    }),
    getUpgradeHistory: builder.query<UpgradeHistory[], number>({
      query: (characterId) => `/character/${characterId}/forge/history`,
    }),
  }),
});
```

---

## ШАГ 9: Навигация между секциями

### 9.1 Логика переключения

```typescript
// В Dashboard.tsx
const [activeSection, setActiveSection] = useState<'main' | 'inventory'>('main');
const [showForge, setShowForge] = useState(false);

// Inventory button click
const handleInventoryClick = () => {
  setActiveSection('inventory');
  setShowForge(false);
};

// Forge button click
const handleForgeClick = () => {
  setShowForge(true);
  setActiveSection('main');
};

// Back to main
const handleBackToMain = () => {
  setActiveSection('main');
  setShowForge(false);
};
```

### 9.2 Навигация внутри InventorySection

**Табы Inventory ↔ Forge:**
```tsx
<InventorySection
  characterId={character.id}
  onNavigateToForge={() => {
    setShowForge(true);
    setActiveSection('main');
  }}
  showForge={showForge}
  onNavigateToInventory={() => setShowForge(false)}
/>
```

---

## ШАГ 10: Рефакторинг существующих страниц

### 10.1 Inventory.tsx

**Опции:**
1. **Удалить полностью** - вся логика теперь в `InventorySection.tsx`
2. **Оставить для совместимости** - редирект на Dashboard
3. **Переиспользовать компонент** - использовать `InventorySection` внутри страницы

**Рекомендация:** Оставить страницу, но использовать тот же компонент `InventorySection`:
```tsx
// pages/Inventory.tsx
import { InventorySection } from '../components/dashboard/InventorySection';

export default function InventoryPage() {
  const characterId = Number(localStorage.getItem('characterId'));

  return (
    <div className="w-full h-full">
      <InventorySection characterId={characterId} />
    </div>
  );
}
```

### 10.2 Blacksmith.tsx

**Аналогично Inventory:**
```tsx
// pages/Blacksmith.tsx
import { ForgeSection } from '../components/dashboard/ForgeSection';

export default function BlacksmithPage() {
  const characterId = Number(localStorage.getItem('characterId'));

  return (
    <div className="w-full h-full">
      <ForgeSection characterId={characterId} />
    </div>
  );
}
```

### 10.3 Обновить роутинг (опционально)

**Если решили удалить страницы:**
```tsx
// main.tsx или App.tsx
// УДАЛИТЬ или закомментировать:
// { path: '/inventory', element: <Inventory /> },
// { path: '/blacksmith', element: <Blacksmith /> },
```

---

## ШАГ 11: Адаптация под существующую музыку и фон

### 11.1 Структура слоев (z-index)

```tsx
<div className="relative w-[1366px] h-[768px] overflow-hidden">
  {/* Z-INDEX 1: Видео фон */}
  <video className="absolute top-0 left-0 w-full h-full object-cover z-[1]" ... />

  {/* Z-INDEX 2: Основной контент (новый layout) */}
  <div className="relative z-[2] w-full h-full p-4">
    {/* Двухколоночный layout */}
  </div>

  {/* Z-INDEX 1000: Кнопки управления */}
  <div className="absolute top-6 right-6 flex gap-2 z-[30]">
    <button>Music</button>
    <button>FAQ</button>
    <button>Back</button>
  </div>

  {/* Z-INDEX 1000: CharacterSelector */}
  <CharacterSelector ... />
</div>
```

### 11.2 Позиционирование кнопок управления

**Переместить кнопки Music, FAQ, Back:**
```tsx
{/* Top Navigation */}
<div className="absolute top-6 right-6 flex gap-2 z-30">
  <button
    onClick={toggleMusic}
    className="px-4 py-2 border-2 border-amber-700/60 rounded bg-gradient-to-b from-stone-900/90 to-black/95 hover:from-stone-800/90 hover:to-stone-900/95 text-amber-300 transition-all text-xs uppercase tracking-[0.15em] shadow-lg shadow-black/50"
  >
    {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
    Music
  </button>
  <button className="...">FAQ</button>
  <button onClick={handleLogout} className="...">Exit</button>
</div>
```

### 11.3 Сохранить музыку с crossfade

**Не менять логику музыки:**
```tsx
// Оставить без изменений
const audioRef = useRef<HTMLAudioElement>(null);
const audioRef2 = useRef<HTMLAudioElement>(null);

useEffect(() => {
  // Существующая логика crossfade
  ...
}, [isMusicPlaying]);
```

---

## ШАГ 12: Тестирование и отладка

### 12.1 Чеклист функциональности

- [ ] Видео фон отображается корректно
- [ ] Музыка с crossfade работает
- [ ] Кнопки Music, Exit функционируют
- [ ] CharacterSelector отображается справа
- [ ] Загрузка персонажа через RTK Query работает
- [ ] Переключение между секциями (main ↔ inventory ↔ forge) работает плавно
- [ ] CharacterCard показывает реальные данные персонажа
- [ ] InventorySection:
  - [ ] Загружает инвентарь из API
  - [ ] Показывает детали выбранного предмета
  - [ ] Табы Inventory ↔ Forge работают
- [ ] ForgeSection:
  - [ ] Можно выбрать предмет и свиток
  - [ ] Кнопка Upgrade работает
  - [ ] История улучшений загружается
- [ ] ChatSection:
  - [ ] WebSocket подключение работает
  - [ ] Табы переключаются
  - [ ] Сообщения отображаются
- [ ] Навигация на внешние страницы (Dungeon, PvP, Specialization, Class Mentor) работает

### 12.2 Проверка производительности

```bash
# Запустить dev сервер
npm run dev

# Открыть DevTools → Performance
# Проверить:
# - Нет лагов при переключении секций
# - Рендер компонентов оптимизирован
# - Нет memory leaks
```

### 12.3 Проверка типизации

```bash
# Запустить TypeScript проверку
npx tsc --noEmit
```

### 12.4 Проверка стилей

- [ ] Tailwind классы применяются корректно
- [ ] Декоративные элементы (уголки) отображаются
- [ ] Градиенты и тени работают
- [ ] Hover эффекты функционируют
- [ ] Responsive (если применимо)

---

## ИТОГОВАЯ СТРУКТУРА ФАЙЛОВ

```
Elbrus-Arena/frontend/src/
├── pages/
│   ├── Dashboard.tsx                    # ← ОСНОВНОЙ РЕФАКТОРИНГ
│   ├── Inventory.tsx                    # ← ОПЦИОНАЛЬНО: переиспользовать InventorySection
│   └── Blacksmith.tsx                   # ← ОПЦИОНАЛЬНО: переиспользовать ForgeSection
├── components/
│   ├── dashboard/                       # ← НОВАЯ ПАПКА
│   │   ├── CharacterCard.tsx           # ← СОЗДАТЬ
│   │   ├── ChatSection.tsx             # ← СОЗДАТЬ
│   │   ├── InventorySection.tsx        # ← СОЗДАТЬ (из figmareference)
│   │   ├── ForgeSection.tsx            # ← СОЗДАТЬ (из figmareference)
│   │   └── NavigationButtons.tsx       # ← СОЗДАТЬ
│   ├── CharacterSelector.tsx            # Существующий (оставить)
│   └── ChatWindow.tsx                   # Существующий (интегрировать в ChatSection)
├── store/
│   └── api/
│       ├── inventoryApi.ts             # ← СОЗДАТЬ или использовать существующий
│       └── forgeApi.ts                 # ← СОЗДАТЬ
├── types/
│   └── api.ts                          # Добавить типы для Inventory, Forge
└── index.css                           # Добавить Tailwind импорты
```

---

## ВАЖНЫЕ ЗАМЕЧАНИЯ

### 1. Не ломать существующую функциональность

**Критически важно сохранить:**
- Музыку с crossfade
- Видео фон
- Загрузку персонажей через RTK Query
- Стамину (pollingInterval)
- CharacterSelector
- Logout функционал
- WebSocket чат

### 2. Постепенная миграция

**Рекомендуемая последовательность:**
1. Настроить Tailwind
2. Создать компоненты (CharacterCard, ChatSection, InventorySection, ForgeSection, NavigationButtons)
3. Протестировать компоненты изолированно
4. Интегрировать в Dashboard
5. Тестировать полную функциональность
6. Рефакторить старые страницы (Inventory, Blacksmith)

**Feature flag (опционально):**
```typescript
const USE_NEW_LAYOUT = true; // переключатель

return USE_NEW_LAYOUT ? <NewDashboardLayout /> : <OldDashboardLayout />;
```

### 3. API интеграция

**Если API нет - создать mock данные:**
```typescript
// mock/inventory.ts
export const mockInventory: Item[] = [
  { id: 1, name: 'Ancient Sword', type: 'SWORD', armor: 15, gold: 22 },
  // ...
];
```

**Постепенно заменить на реальные API endpoints.**

### 4. Типизация TypeScript

**Все новые компоненты должны иметь строгие типы:**
```typescript
// types/api.ts
export interface Item {
  id: number;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  stats: ItemStats;
  // ...
}

export type ItemType = 'WEAPON' | 'HELMET' | 'ARMOR' | 'BOOTS' | 'BELT' | 'RING';
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface ItemStats {
  damage?: number;
  armor?: number;
  strength?: number;
  agility?: number;
  intelligence?: number;
}

export interface UpgradeResult {
  success: boolean;
  item?: Item;
  message: string;
}

export interface UpgradeHistory {
  id: number;
  timestamp: string;
  itemName: string;
  success: boolean;
  message: string;
}
```

### 5. Responsive дизайн (опционально)

**Если нужно адаптировать под разные разрешения:**
```tsx
// Использовать Tailwind breakpoints
<div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
  {/* ... */}
</div>
```

---

## ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ (после базовой миграции)

1. **Анимации переходов:**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
>
  <InventorySection ... />
</motion.div>
```

2. **Drag & Drop для экипировки:**
```tsx
import { DndProvider, useDrag, useDrop } from 'react-dnd';
```

3. **Оптимизация производительности:**
```tsx
import { memo, useMemo, useCallback } from 'react';

export const CharacterCard = memo(({ character }: CharacterCardProps) => {
  // ...
});
```

4. **Error boundaries:**
```tsx
<ErrorBoundary fallback={<ErrorMessage />}>
  <InventorySection ... />
</ErrorBoundary>
```

5. **Загрузочные состояния:**
```tsx
{isLoading ? (
  <div className="flex items-center justify-center h-full">
    <Spinner />
  </div>
) : (
  <InventorySection ... />
)}
```

---

## ЗАКЛЮЧЕНИЕ

Этот план обеспечивает:
- ✅ Плавную миграцию без поломки функционала
- ✅ Модульную структуру компонентов
- ✅ Интеграцию с существующим API
- ✅ Современный дизайн с Tailwind CSS
- ✅ Улучшенный UX с встроенными секциями
- ✅ Типобезопасность TypeScript

**Следуйте шагам последовательно, тестируйте после каждого этапа.**

Удачи с миграцией! 🚀
