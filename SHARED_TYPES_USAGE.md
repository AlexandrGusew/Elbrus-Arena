# Использование Shared Types

## 📁 Структура

```
Elbrus-Arena/
├── shared/
│   └── types/
│       ├── index.ts           # Экспорт всех типов
│       ├── enums.ts            # Union types и константы
│       ├── user.types.ts       # Типы для пользователя
│       ├── character.types.ts  # Типы для персонажа
│       ├── dungeon.types.ts    # Типы для данжей
│       └── item.types.ts       # Типы для предметов
├── backend/
└── frontend/
```

## 🔧 Настройка

### Backend (уже настроено)

В backend используются типы напрямую:

```typescript
import type { Character, CharacterClass, CreateCharacterDto } from '../../../shared/types';
```

### Frontend (настроено)

**tsconfig.app.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src", "../shared"]
}
```

**vite.config.ts:**
```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
})
```

## 💡 Использование на Frontend

### Импорт типов

```typescript
// Вариант 1: Импорт из @shared
import type {
  Character,
  CharacterClass,
  CHARACTER_CLASSES,
  Item,
  ItemType,
  ITEM_TYPES
} from '@shared/types';

// Вариант 2: Через созданный файл api.ts
import type { Character, ItemType } from '../types/api';
import { CHARACTER_CLASSES, ITEM_TYPES } from '../types/api';
```

### Примеры использования

#### 1. В компонентах React

```typescript
import type { Character, CharacterWithInventory } from '@shared/types';

interface CharacterCardProps {
  character: Character;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <div>
      <h2>{character.name}</h2>
      <p>Class: {character.class}</p>
      <p>Level: {character.level}</p>
    </div>
  );
};
```

#### 2. В API запросах

```typescript
import axios from 'axios';
import type {
  Character,
  CreateCharacterDto,
  DungeonWithMonsters,
  Item
} from '@shared/types';

export const characterApi = {
  create: async (data: CreateCharacterDto): Promise<Character> => {
    const response = await axios.post<Character>('/character', data);
    return response.data;
  },

  getById: async (id: number): Promise<CharacterWithInventory | null> => {
    const response = await axios.get<CharacterWithInventory>(`/character/${id}`);
    return response.data;
  },
};

export const dungeonApi = {
  getAll: async (): Promise<DungeonWithMonsters[]> => {
    const response = await axios.get<DungeonWithMonsters[]>('/dungeons');
    return response.data;
  },
};

export const itemApi = {
  getAll: async (): Promise<Item[]> => {
    const response = await axios.get<Item[]>('/items');
    return response.data;
  },
};
```

#### 3. В Redux Toolkit

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Character } from '@shared/types';

interface CharacterState {
  current: Character | null;
  loading: boolean;
}

const initialState: CharacterState = {
  current: null,
  loading: false,
};

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    setCharacter: (state, action: PayloadAction<Character>) => {
      state.current = action.payload;
    },
  },
});
```

#### 4. Использование Union Types

```typescript
import { CHARACTER_CLASSES, ITEM_TYPES } from '@shared/types';
import type { CharacterClass, ItemType } from '@shared/types';

// Dropdown для выбора класса
export const ClassSelector: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');

  return (
    <select
      value={selectedClass}
      onChange={(e) => setSelectedClass(e.target.value as CharacterClass)}
    >
      {CHARACTER_CLASSES.map((cls) => (
        <option key={cls} value={cls}>
          {cls}
        </option>
      ))}
    </select>
  );
};

// Фильтр по типу предмета
export const ItemFilter: React.FC = () => {
  const [filter, setFilter] = useState<ItemType | 'all'>('all');

  return (
    <div>
      {ITEM_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => setFilter(type)}
          className={filter === type ? 'active' : ''}
        >
          {type}
        </button>
      ))}
    </div>
  );
};
```

## ✅ Доступные типы

### Enums (Union Types)

```typescript
// Константы для runtime
export const CHARACTER_CLASSES = ['warrior', 'mage', 'assassin'] as const;
export const ITEM_TYPES = ['weapon', 'helmet', 'armor', 'belt', 'legs', 'potion'] as const;
export const DUNGEON_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

// Типы для compile-time
export type CharacterClass = typeof CHARACTER_CLASSES[number]; // 'warrior' | 'mage' | 'assassin'
export type ItemType = typeof ITEM_TYPES[number];
export type DungeonDifficulty = typeof DUNGEON_DIFFICULTIES[number];
```

### Основные интерфейсы

- `User`, `CreateUserDto`
- `Character`, `CharacterWithInventory`, `CreateCharacterDto`
- `Dungeon`, `DungeonWithMonsters`
- `Monster`
- `Item`, `InventoryItem`, `Inventory`

## 🎯 Преимущества

1. **Type Safety** - автодополнение и проверка типов во всем проекте
2. **Single Source of Truth** - одно место для изменения типов
3. **Нет дублирования** - типы определены один раз
4. **Union Types** - невозможно использовать неправильное значение
5. **Легкая поддержка** - изменения в одном месте применяются везде

## 🔍 Примеры ошибок, которые предотвращаются

```typescript
// ❌ Ошибка: Type '"wizard"' is not assignable to type 'CharacterClass'
const myClass: CharacterClass = 'wizard';

// ✅ Правильно
const myClass: CharacterClass = 'warrior';

// ❌ Ошибка: Property 'userId' is missing
const dto: CreateCharacterDto = {
  name: 'Test',
  class: 'warrior'
};

// ✅ Правильно
const dto: CreateCharacterDto = {
  userId: 1,
  name: 'Test',
  class: 'warrior'
};
```

## 📝 Рекомендации

1. **Всегда используйте** `import type` для импорта только типов
2. **Используйте константы** (`CHARACTER_CLASSES`) для dropdown/select
3. **Используйте типы** (`CharacterClass`) для переменных и параметров
4. **Создавайте API wrapper** с правильными типами возврата
5. **Не дублируйте** типы - всегда импортируйте из `@shared/types`
