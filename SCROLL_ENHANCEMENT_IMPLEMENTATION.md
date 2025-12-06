# План реализации системы свитков улучшения предметов

## Обзор

Добавление системы свитков для гарантированного улучшения предметов. Свитки делятся на 3 типа:
1. **Свиток заточки оружия** - для предметов типа `weapon`
2. **Свиток заточки брони** - для предметов типа `helmet`, `armor`, `legs`
3. **Свиток заточки аксессуаров** - для предметов типа `belt`, `accessory`

---

## Шаг 1: Обновление схемы базы данных

### Файл: `backend/prisma/schema.prisma`

**Действие:** Добавить тип `scroll` в enum `ItemType`

**Изменение:**
```prisma
enum ItemType {
  weapon
  helmet
  armor
  belt
  legs
  accessory
  potion
  shield
  offhand
  scroll  // ← Добавить эту строку
}
```

**Проверка:** Убедиться, что модель `Item` поддерживает все необходимые поля (уже есть).

---

## Шаг 2: Создание миграции базы данных

### Команда:
```bash
cd backend
npx prisma migrate dev --name add_scroll_item_type
```

**Ожидаемый результат:** Создана новая миграция в `backend/prisma/migrations/`

**Проверка:** 
- Миграция создана успешно
- В миграционном файле добавлен `scroll` в enum

---

## Шаг 3: Создание свитков в seed данных

### Файл: `backend/prisma/seed.ts`

**Действие:** Добавить создание 3 свитков после существующих предметов

**Код для добавления (после создания всех существующих предметов):**

```typescript
// ============================================
// СВИТКИ УЛУЧШЕНИЯ
// ============================================

// Свиток улучшения оружия
const weaponScroll = await prisma.item.create({
  data: {
    name: 'Свиток заточки оружия',
    type: 'scroll',
    description: 'Гарантированно улучшает оружие на +1 уровень',
    damage: 0,
    armor: 0,
    bonusStr: 0,
    bonusAgi: 0,
    bonusInt: 0,
    price: 0, // Не продается
    minStrength: 0,
    minAgility: 0,
    minIntelligence: 0,
    minLevel: 1,
  },
});

// Свиток улучшения брони
const armorScroll = await prisma.item.create({
  data: {
    name: 'Свиток заточки брони',
    type: 'scroll',
    description: 'Гарантированно улучшает шлем, доспех или сапоги на +1 уровень',
    damage: 0,
    armor: 0,
    bonusStr: 0,
    bonusAgi: 0,
    bonusInt: 0,
    price: 0,
    minStrength: 0,
    minAgility: 0,
    minIntelligence: 0,
    minLevel: 1,
  },
});

// Свиток улучшения аксессуаров
const accessoryScroll = await prisma.item.create({
  data: {
    name: 'Свиток заточки аксессуаров',
    type: 'scroll',
    description: 'Гарантированно улучшает пояс или кольцо на +1 уровень',
    damage: 0,
    armor: 0,
    bonusStr: 0,
    bonusAgi: 0,
    bonusInt: 0,
    price: 0,
    minStrength: 0,
    minAgility: 0,
    minIntelligence: 0,
    minLevel: 1,
  },
});

console.log('✅ Свитки улучшения созданы');
```

**Проверка:** Код добавлен в правильное место в seed.ts

---

## Шаг 4: Добавление дропа свитков монстрам

### Файл: `backend/prisma/seed.ts`

**Действие:** Добавить `MonsterLoot` записи для дропа свитков

**Код для добавления (после создания всех MonsterLoot записей):**

```typescript
// ============================================
// ДРОП СВИТКОВ С МОНСТРОВ
// ============================================

// Боссы дропают свитки с шансом 15%
await prisma.monsterLoot.createMany({
  data: [
    // Свитки с демона (босс)
    {
      monsterId: demon.id,
      itemId: weaponScroll.id,
      dropChance: 0.15, // 15% шанс
      minCount: 1,
      maxCount: 1,
    },
    {
      monsterId: demon.id,
      itemId: armorScroll.id,
      dropChance: 0.15,
      minCount: 1,
      maxCount: 1,
    },
    {
      monsterId: demon.id,
      itemId: accessoryScroll.id,
      dropChance: 0.15,
      minCount: 1,
      maxCount: 1,
    },
    // Можно добавить дроп с других боссов или сложных монстров
  ],
});

console.log('✅ Дроп свитков настроен');
```

**Проверка:** 
- Записи добавлены для нужных монстров
- Шансы дропа настроены (рекомендуется 10-20% для боссов)

---

## Шаг 5: Обновление типов на фронтенде

### Файл: `shared/types/enums.ts`

**Действие:** Убедиться, что `ITEM_TYPES` включает `scroll`

**Проверка текущего кода:**
```typescript
export const ITEM_TYPES = ['weapon', 'helmet', 'armor', 'belt', 'legs', 'accessory', 'potion', 'shield', 'offhand', 'scroll'] as const;
```

**Если `scroll` отсутствует - добавить:**
```typescript
export const ITEM_TYPES = ['weapon', 'helmet', 'armor', 'belt', 'legs', 'accessory', 'potion', 'shield', 'offhand', 'scroll'] as const;
```

**Проверка:** Тип `scroll` присутствует в массиве

---

## Шаг 6: Создание логики использования свитков в Backend

### Файл: `backend/src/inventory/inventory-enhancement.service.ts`

**Действие:** Добавить новый метод `enhanceItemWithScroll`

**Код для добавления (после метода `enhanceItem`):**

```typescript
/**
 * Улучшить предмет с помощью свитка (гарантированный успех)
 * @param characterId ID персонажа
 * @param inventoryItemId ID предмета для улучшения
 * @param scrollInventoryItemId ID свитка из инвентаря
 */
async enhanceItemWithScroll(
  characterId: number,
  inventoryItemId: number,
  scrollInventoryItemId: number,
): Promise<{
  success: boolean;
  newEnhancementLevel: number;
  scrollUsed: string;
}> {
  // 1. Получить персонажа с инвентарем
  const character = await this.prisma.character.findUnique({
    where: { id: characterId },
    include: {
      inventory: {
        include: {
          items: {
            where: {
              id: { in: [inventoryItemId, scrollInventoryItemId] },
            },
            include: { item: true },
          },
        },
      },
    },
  });

  if (!character || !character.inventory) {
    throw new NotFoundException('Character or inventory not found');
  }

  // 2. Найти предмет и свиток
  const itemToEnhance = character.inventory.items.find(i => i.id === inventoryItemId);
  const scroll = character.inventory.items.find(i => i.id === scrollInventoryItemId);

  if (!itemToEnhance) {
    throw new NotFoundException('Item to enhance not found');
  }

  if (!scroll) {
    throw new NotFoundException('Scroll not found');
  }

  if (scroll.item.type !== 'scroll') {
    throw new BadRequestException('Selected item is not a scroll');
  }

  // 3. Проверить совместимость свитка с предметом
  const scrollName = scroll.item.name.toLowerCase();
  const itemType = itemToEnhance.item.type;

  let isCompatible = false;

  if (scrollName.includes('оружие') || scrollName.includes('weapon')) {
    isCompatible = itemType === 'weapon';
  } else if (scrollName.includes('броня') || scrollName.includes('armor')) {
    isCompatible = ['helmet', 'armor', 'legs'].includes(itemType);
  } else if (scrollName.includes('аксессуар') || scrollName.includes('accessory')) {
    isCompatible = ['belt', 'accessory'].includes(itemType);
  }

  if (!isCompatible) {
    throw new BadRequestException(
      `This scroll cannot be used on this item type. Scroll: ${scroll.item.name}, Item: ${itemToEnhance.item.type}`
    );
  }

  // 4. Проверить, что предмет не зелье
  if (itemToEnhance.item.type === 'potion') {
    throw new BadRequestException('Cannot enhance potions');
  }

  // 5. Выполнить улучшение в транзакции
  await this.prisma.$transaction([
    // Увеличить enhancement предмета
    this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { enhancement: itemToEnhance.enhancement + 1 },
    }),
    // Удалить использованный свиток
    this.prisma.inventoryItem.delete({
      where: { id: scrollInventoryItemId },
    }),
  ]);

  return {
    success: true,
    newEnhancementLevel: itemToEnhance.enhancement + 1,
    scrollUsed: scroll.item.name,
  };
}
```

**Проверка:** 
- Метод добавлен в сервис
- Логика совместимости работает корректно
- Транзакция выполняется атомарно

---

## Шаг 7: Добавление API endpoint в контроллер

### Файл: `backend/src/character/character.controller.ts`

**Действие:** Добавить endpoint для улучшения со свитком

**Код для добавления (после существующих endpoints):**

```typescript
@Post(':characterId/forge/enhance-with-scroll')
async enhanceItemWithScroll(
  @Param('characterId') characterId: string,
  @Body() body: { itemId: number; scrollId: number },
) {
  return this.inventoryEnhancementService.enhanceItemWithScroll(
    Number(characterId),
    body.itemId,
    body.scrollId,
  );
}
```

**Проверка:**
- `InventoryEnhancementService` импортирован в контроллер
- Endpoint добавлен в правильное место
- Метод доступен через `/character/:characterId/forge/enhance-with-scroll`

---

## Шаг 8: Обновление RTK Query API на фронтенде

### Файл: `frontend/src/store/api/characterApi.ts`

**Действие:** Добавить мутацию для улучшения со свитком

**Код для добавления (после мутации `enhanceItem`):**

```typescript
enhanceItemWithScroll: builder.mutation<
  { success: boolean; newEnhancementLevel: number; scrollUsed: string },
  { characterId: number; itemId: number; scrollId: number }
>({
  query: ({ characterId, itemId, scrollId }) => ({
    url: `/character/${characterId}/forge/enhance-with-scroll`,
    method: 'POST',
    body: { itemId, scrollId },
  }),
  invalidatesTags: (result, error, { characterId }) => [
    { type: 'Character', id: characterId },
  ],
}),
```

**Действие:** Экспортировать хук

**Код для добавления в экспорты:**
```typescript
useEnhanceItemWithScrollMutation,
```

**Проверка:**
- Мутация добавлена
- Хук экспортирован
- `invalidatesTags` настроен для обновления данных

---

## Шаг 9: Обновление ForgeSection на фронтенде

### Файл: `frontend/src/components/dashboard/ForgeSection.tsx`

**9.1. Добавить импорт мутации:**

```typescript
import { useEnhanceItemMutation, useEnhanceItemWithScrollMutation } from '../../store/api/characterApi';
```

**9.2. Добавить состояние и мутацию:**

```typescript
const [enhanceItemWithScroll] = useEnhanceItemWithScrollMutation();
```

**9.3. Обновить `handleUpgrade` для использования свитка:**

Заменить существующий метод `handleUpgrade` на:

```typescript
const handleUpgrade = async () => {
  if (!itemInSlot || isEnhancing) return;

  // Если есть свиток - используем его (гарантированный успех)
  if (scrollInSlot) {
    try {
      const result = await enhanceItemWithScroll({
        characterId: character.id,
        itemId: itemInSlot.id,
        scrollId: scrollInSlot.id,
      }).unwrap();

      const message = `Успешное улучшение с ${result.scrollUsed}: ${itemInSlot.item.name}+${itemInSlot.enhancement} → +${result.newEnhancementLevel}`;
      
      setUpgradeHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          message,
          success: true,
        },
        ...prev.slice(0, 9),
      ]);

      // Сбрасываем предмет и свиток после успешного улучшения
      onItemChange(null);
      setScrollInSlot(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Ошибка улучшения предмета';
      setUpgradeHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          message: `Ошибка: ${errorMessage}`,
          success: false,
        },
        ...prev.slice(0, 9),
      ]);
    }
    return;
  }

  // Иначе используем обычное улучшение за золото (20% шанс)
  try {
    const result = await enhanceItem({
      characterId: character.id,
      itemId: itemInSlot.id,
    }).unwrap();

    const message = result.success
      ? `Успешное улучшение: ${itemInSlot.item.name}+${itemInSlot.enhancement} → +${result.newEnhancementLevel}`
      : `Неудача: ${itemInSlot.item.name}+${itemInSlot.enhancement} не удалось улучшить`;

    setUpgradeHistory(prev => [
      {
        id: Date.now(),
        timestamp: new Date(),
        message,
        success: result.success,
      },
      ...prev.slice(0, 9),
    ]);

    // Сбрасываем предмет из слота после улучшения
    onItemChange(null);
  } catch (error: any) {
    const errorMessage = error?.data?.message || 'Ошибка улучшения предмета';
    setUpgradeHistory(prev => [
      {
        id: Date.now(),
        timestamp: new Date(),
        message: `Ошибка: ${errorMessage}`,
        success: false,
      },
      ...prev.slice(0, 9),
    ]);
  }
};
```

**9.4. Добавить drag & drop для свитков:**

Добавить новый обработчик:

```typescript
const handleScrollDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);

  const itemData = e.dataTransfer.getData('inventory-item');
  if (itemData) {
    try {
      const item: InventoryItem = JSON.parse(itemData);
      // Проверяем, что это свиток
      if (item.item.type === 'scroll') {
        setScrollInSlot(item);
      } else {
        alert('Можно использовать только свитки!');
      }
    } catch (error) {
      console.error('Error parsing scroll item:', error);
    }
  }
};
```

**9.5. Обновить слот свитка для поддержки drag & drop:**

Найти блок с `Scroll Slot` и обновить:

```typescript
<div
  className={`aspect-square border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all relative overflow-hidden cursor-pointer ${
    isDragOver ? 'border-green-500/80 bg-green-950/30' : ''
  }`}
  onClick={() => setScrollInSlot(null)}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleScrollDrop} // ← Изменить на handleScrollDrop
>
  {scrollInSlot ? (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      <ItemIcon
        item={scrollInSlot.item}
        size="medium"
        showName={true}
      />
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-amber-700/30 rounded-lg m-1">
      <span className="text-amber-300/40 text-xs text-center" style={{ fontFamily: 'serif' }}>
        Scroll Slot
      </span>
    </div>
  )}
</div>
```

**Проверка:**
- Импорты добавлены
- Мутация используется
- Drag & drop работает для свитков
- Логика улучшения проверяет наличие свитка

---

## Шаг 10: Обновление InventorySection для отображения свитков

### Файл: `frontend/src/components/dashboard/InventorySection.tsx`

**Действие:** Добавить иконку и название для свитков

**10.1. Обновить `SLOT_ICONS`:**

```typescript
const SLOT_ICONS: Record<ItemType, string> = {
  weapon: '⚔️',
  helmet: '🪖',
  armor: '🛡️',
  belt: '🔗',
  legs: '👖',
  accessory: '💍',
  potion: '🧪',
  shield: '🛡️',
  offhand: '🗡️',
  scroll: '📜', // ← Добавить
};
```

**10.2. Обновить `SLOT_NAMES`:**

```typescript
const SLOT_NAMES: Record<ItemType, string> = {
  weapon: 'Оружие',
  helmet: 'Шлем',
  armor: 'Броня',
  belt: 'Пояс',
  legs: 'Штаны',
  accessory: 'Аксессуар',
  potion: 'Зелье',
  shield: 'Щит',
  offhand: 'Левая рука',
  scroll: 'Свиток', // ← Добавить
};
```

**Проверка:**
- Иконки и названия добавлены
- Свитки отображаются в инвентаре корректно

---

## Шаг 11: Обновление ItemIcon компонента (если нужно)

### Файл: `frontend/src/components/common/ItemIcon.tsx`

**Действие:** Проверить, корректно ли компонент отображает свитки

**Проверка:**
- Компонент поддерживает тип `scroll`
- Если нет - добавить обработку для `scroll` типа

**Если нужно добавить:**
```typescript
// В компоненте ItemIcon добавить обработку для scroll
if (item.type === 'scroll') {
  // Логика отображения свитка
}
```

---

## Шаг 12: Запуск seed для создания свитков

### Команда:
```bash
cd backend
npx prisma db seed
```

**Или если seed не настроен:**
```bash
npx ts-node prisma/seed.ts
```

**Проверка:**
- Свитки созданы в БД
- Можно проверить через Prisma Studio: `npx prisma studio`

---

## Шаг 13: Тестирование

### Чеклист тестирования:

- [ ] **Проверка БД:**
  - [ ] Свитки созданы в таблице `items`
  - [ ] Тип `scroll` доступен в enum `ItemType`
  - [ ] MonsterLoot записи созданы

- [ ] **Проверка дропа:**
  - [ ] Свитки дропаются с монстров после боя
  - [ ] Свитки появляются в инвентаре

- [ ] **Проверка UI:**
  - [ ] Свитки отображаются в инвентаре с правильной иконкой
  - [ ] Свитки можно перетащить в ForgeSection
  - [ ] Свитки отображаются в слоте свитка

- [ ] **Проверка улучшения:**
  - [ ] Свиток оружия работает только с оружием
  - [ ] Свиток брони работает с шлемом, доспехом, сапогами
  - [ ] Свиток аксессуаров работает с поясом и кольцом
  - [ ] Улучшение со свитком всегда успешно (100%)
  - [ ] Свиток удаляется после использования
  - [ ] Предмет получает +1 к enhancement

- [ ] **Проверка ошибок:**
  - [ ] Несовместимый свиток показывает ошибку
  - [ ] Попытка улучшить зелье показывает ошибку
  - [ ] История улучшений обновляется

---

## Дополнительные улучшения (опционально)

### 1. Визуальная индикация совместимости

**Идея:** Подсвечивать предмет, если выбран совместимый свиток

**Реализация в ForgeSection:**
```typescript
const isScrollCompatible = () => {
  if (!itemInSlot || !scrollInSlot) return false;
  
  const scrollName = scrollInSlot.item.name.toLowerCase();
  const itemType = itemInSlot.item.type;
  
  if (scrollName.includes('оружие') || scrollName.includes('weapon')) {
    return itemType === 'weapon';
  } else if (scrollName.includes('броня') || scrollName.includes('armor')) {
    return ['helmet', 'armor', 'legs'].includes(itemType);
  } else if (scrollName.includes('аксессуар') || scrollName.includes('accessory')) {
    return ['belt', 'accessory'].includes(itemType);
  }
  
  return false;
};
```

### 2. Информация о свитке

**Идея:** Показывать подсказку, для каких типов предметов подходит свиток

### 3. Ограничение использования

**Идея:** Можно использовать только на предметах определенного уровня enhancement (например, только до +5)

---

## Резюме изменений

### Backend:
- ✅ `schema.prisma` - добавить `scroll` в `ItemType`
- ✅ Миграция БД
- ✅ `seed.ts` - создать 3 свитка и добавить дроп
- ✅ `inventory-enhancement.service.ts` - метод `enhanceItemWithScroll`
- ✅ `character.controller.ts` - endpoint для улучшения со свитком

### Frontend:
- ✅ `shared/types/enums.ts` - добавить `scroll` в `ITEM_TYPES`
- ✅ `characterApi.ts` - мутация `enhanceItemWithScroll`
- ✅ `ForgeSection.tsx` - логика использования свитков
- ✅ `InventorySection.tsx` - иконки и названия для свитков

---

## Порядок выполнения

1. **Backend изменения:**
   - Шаг 1: Обновить schema.prisma
   - Шаг 2: Создать миграцию
   - Шаг 3: Добавить свитки в seed.ts
   - Шаг 4: Добавить дроп свитков
   - Шаг 5: Обновить типы (если нужно)
   - Шаг 6: Создать метод enhanceItemWithScroll
   - Шаг 7: Добавить endpoint в контроллер
   - Шаг 12: Запустить seed

2. **Frontend изменения:**
   - Шаг 5: Обновить типы
   - Шаг 8: Добавить мутацию в RTK Query
   - Шаг 9: Обновить ForgeSection
   - Шаг 10: Обновить InventorySection
   - Шаг 11: Проверить ItemIcon

3. **Тестирование:**
   - Шаг 13: Полное тестирование функционала

---

## Примечания

- Свитки имеют `price: 0` и не продаются
- Свитки удаляются после использования (не расходуемые, а одноразовые)
- Улучшение со свитком всегда успешно (100% шанс)
- Обычное улучшение за золото остается с 20% шансом
- Свитки можно использовать только на совместимых типах предметов

---

## Возможные проблемы и решения

### Проблема: Свиток не дропается
**Решение:** Проверить шансы дропа в MonsterLoot, убедиться что они > 0

### Проблема: Ошибка совместимости
**Решение:** Проверить логику проверки совместимости в `enhanceItemWithScroll`

### Проблема: Свиток не отображается в инвентаре
**Решение:** Проверить, что тип `scroll` добавлен в `ITEM_TYPES` и `SLOT_ICONS`

### Проблема: Drag & drop не работает
**Решение:** Проверить, что `handleScrollDrop` правильно обрабатывает данные из `dataTransfer`

---

**Дата создания:** 2024
**Статус:** Готов к реализации

