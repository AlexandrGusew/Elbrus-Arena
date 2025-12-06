# План реализации: Перенос выбора персонажа в Dashboard

## Общая концепция

**Цель:** Перенести выбор персонажа со страницы входа в Dashboard. После авторизации по логину пользователь попадает на Dashboard, где может выбрать одного из 3 персонажей (по одному на каждый класс).

**Ключевые изменения:**
1. Страница входа (`CreateCharacter`) - только авторизация по имени
2. Dashboard - выбор персонажа справа, модальное окно с характеристиками
3. БД - один пользователь может иметь до 3 персонажей (один на класс)
4. Автосоздание - при первом логине создаются 3 персонажа 1 уровня

---

## ЭТАП 1: Изменение схемы базы данных

### Шаг 1.1: Обновить Prisma Schema ✅ ВЫПОЛНЕНО

**Файл:** `backend/prisma/schema.prisma`

**Изменения:**

1. **Модель User:**
   ```prisma
   model User {
     id         Int        @id @default(autoincrement())
     telegramId BigInt     @unique
     username   String?
     firstName  String?
     createdAt  DateTime   @default(now())
     characters Character[]  // ИЗМЕНИТЬ: было Character?, стало Character[]
     
     @@map("users")
   }
   ```

2. **Модель Character:**
   ```prisma
   model Character {
     id                 Int                @id @default(autoincrement())
     userId             Int                // УБРАТЬ @unique отсюда
     name               String             @unique
     class              String
     // ... все остальные поля остаются без изменений
     
     user               User               @relation(fields: [userId], references: [id])
     // ... остальные связи
     
     @@index([userId])  // ДОБАВИТЬ: индекс для быстрого поиска персонажей пользователя
     @@map("characters")
   }
   ```

**Что это дает:**
- Один User может иметь несколько Character (до 3)
- Быстрый поиск всех персонажей пользователя через индекс

### Шаг 1.2: Создать и применить миграцию ✅ ВЫПОЛНЕНО

**Команды:**
```bash
cd backend
npx prisma migrate dev --name change_user_character_to_one_to_many
npx prisma generate
```

**Примечание:** Из-за рассинхронизации миграций выполнено вручную через SQL скрипт:
- Создан скрипт `backend/scripts/remove-userid-unique.js`
- Выполнены SQL команды для удаления unique constraint с userId
- Создан обычный индекс на userId
- Выполнен `npx prisma generate` для обновления Prisma Client

**Проверка:**
- ✅ Unique constraint удален с userId в таблице characters
- ✅ Создан индекс на userId
- ✅ Prisma Client обновлен

---

## ЭТАП 2: Бэкенд - API для работы с несколькими персонажами

### Шаг 2.1: Обновить Character Service ✅ ВЫПОЛНЕНО

**Файл:** `backend/src/character/character.service.ts`

**Добавить методы:**

1. **Получить всех персонажей пользователя:**
   ```typescript
   async findByUserId(userId: number): Promise<Character[]> {
     return this.prisma.character.findMany({
       where: { userId },
       include: CHARACTER_INCLUDE,
       orderBy: { createdAt: 'asc' }, // Сортировка по дате создания
     }) as Promise<Character[]>;
   }
   ```

2. **Автосоздание 3 персонажей при первом логине:**
   ```typescript
   async autoCreateCharactersForUser(userId: number): Promise<Character[]> {
     // Проверить, есть ли уже персонажи у пользователя
     const existingCharacters = await this.prisma.character.findMany({
       where: { userId },
       select: { class: true },
     });

     const existingClasses = existingCharacters.map(c => c.class);
     const allClasses: CharacterClass[] = ['WARRIOR', 'ROGUE', 'MAGE'];
     const classesToCreate = allClasses.filter(cls => !existingClasses.includes(cls));

     if (classesToCreate.length === 0) {
       // Все персонажи уже созданы
       return this.findByUserId(userId);
     }

     // Создать недостающих персонажей
     const characters = await Promise.all(
       classesToCreate.map(async (classType) => {
         const defaultName = this.getDefaultNameForClass(classType);
         return this.create(userId, defaultName, classType);
       })
     );

     return this.findByUserId(userId);
   }

   private getDefaultNameForClass(classType: CharacterClass): string {
     const classNames = {
       WARRIOR: 'Воин',
       ROGUE: 'Разбойник',
       MAGE: 'Маг',
     };
     return `${classNames[classType]}${Date.now()}`; // Временное имя, пользователь изменит позже
   }
   ```

3. **Обновить метод create - проверка лимита:**
   ```typescript
   async create(userId: number, name: string, characterClass: CharacterClass): Promise<Character> {
     // Проверить, сколько персонажей уже у пользователя
     const userCharacters = await this.prisma.character.findMany({
       where: { userId },
     });

     if (userCharacters.length >= 3) {
       throw new BadRequestException('У пользователя уже есть максимальное количество персонажей (3)');
     }

     // Проверить, нет ли уже персонажа этого класса
     const existingClass = userCharacters.find(c => c.class === characterClass);
     if (existingClass) {
       throw new BadRequestException(`У пользователя уже есть персонаж класса ${characterClass}`);
     }

     // Остальная логика создания остается прежней
     // ...
   }
   ```

4. **Обновить метод updateName (если его нет - создать):**
   ```typescript
   async updateName(characterId: number, newName: string): Promise<Character> {
     // Проверить уникальность имени
     const existing = await this.prisma.character.findUnique({
       where: { name: newName },
     });

     if (existing && existing.id !== characterId) {
       throw new BadRequestException(`Персонаж с именем "${newName}" уже существует`);
     }

     return this.prisma.character.update({
       where: { id: characterId },
       data: { name: newName },
       include: CHARACTER_INCLUDE,
     }) as Promise<Character>;
   }
   ```

### Шаг 2.2: Обновить Character Controller ✅ ВЫПОЛНЕНО

**Файл:** `backend/src/character/character.controller.ts`

**Добавить эндпоинты:**

1. **GET /character/user/:userId - получить всех персонажей пользователя:**
   ```typescript
   @Public()
   @Get('user/:userId')
   async findByUserId(@Param('userId') userId: string): Promise<Character[]> {
     try {
       return await this.characterService.findByUserId(Number(userId));
     } catch (error) {
       this.logger.error(`Error finding characters by userId ${userId}: ${error.message}`, error.stack);
       throw error;
     }
   }
   ```

2. **POST /character/auto-create/:userId - автосоздание персонажей:**
   ```typescript
   @Public()
   @Post('auto-create/:userId')
   async autoCreateCharacters(@Param('userId') userId: string): Promise<Character[]> {
     try {
       return await this.characterService.autoCreateCharactersForUser(Number(userId));
     } catch (error) {
       this.logger.error(`Error auto-creating characters for userId ${userId}: ${error.message}`, error.stack);
       throw error;
     }
   }
   ```

3. **PUT /character/:id/name - изменить имя персонажа:**
   ```typescript
   @Public()
   @Put(':id/name')
   async updateName(
     @Param('id') id: string,
     @Body() dto: { name: string }
   ): Promise<Character> {
     try {
       return await this.characterService.updateName(Number(id), dto.name);
     } catch (error) {
       this.logger.error(`Error updating character name ${id}: ${error.message}`, error.stack);
       throw error;
     }
   }
   ```

### Шаг 2.3: Обновить DTO (если нужно) ✅ ВЫПОЛНЕНО

**Файл:** `backend/src/character/dto/update-character-name.dto.ts` (создан новый)

```typescript
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UpdateCharacterNameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  name: string;
}
```

**Использовать в контроллере:**
```typescript
@Body() dto: UpdateCharacterNameDto
```

---

## ЭТАП 3: Фронтенд - API методы

### Шаг 3.1: Обновить Character API ✅ ВЫПОЛНЕНО

**Файл:** `frontend/src/store/api/characterApi.ts`

**Добавить методы:**

1. **Получить всех персонажей пользователя:**
   ```typescript
   getCharactersByUserId: builder.query<Character[], number>({
     query: (userId) => `/character/user/${userId}`,
     providesTags: (result) =>
       result
         ? result.map(({ id }) => ({ type: 'Character', id }))
         : [],
   }),
   ```

2. **Автосоздание персонажей:**
   ```typescript
   autoCreateCharacters: builder.mutation<Character[], number>({
     query: (userId) => ({
       url: `/character/auto-create/${userId}`,
       method: 'POST',
     }),
     invalidatesTags: ['Character'],
   }),
   ```

3. **Изменить имя персонажа:**
   ```typescript
   updateCharacterName: builder.mutation<Character, { characterId: number; name: string }>({
     query: ({ characterId, name }) => ({
       url: `/character/${characterId}/name`,
       method: 'PUT',
       body: { name },
     }),
     invalidatesTags: (result, error, { characterId }) => [
       { type: 'Character', id: characterId },
     ],
   }),
   ```

**Экспортировать хуки:**
```typescript
export const {
  // ... существующие
  useGetCharactersByUserIdQuery,
  useAutoCreateCharactersMutation,
  useUpdateCharacterNameMutation,
} = characterApi
```

---

## ЭТАП 4: Фронтенд - Упрощение страницы входа

### Шаг 4.1: Обновить CreateCharacter.tsx ✅ ВЫПОЛНЕНО

**Файл:** `frontend/src/pages/CreateCharacter.tsx`

**Изменения:**

1. **Убрать состояние для создания персонажа:**
   - Удалить `mode` (оставить только логин)
   - Удалить `selectedClass`, `hoveredClass`
   - Удалить `name` (оставить только `loginName`)
   - Удалить `createCharacter` mutation

2. **Упростить UI:**
   - Убрать кнопки переключения режима (Create/Login)
   - Убрать кнопки выбора класса (3 иконки)
   - Оставить только форму логина

3. **Обновить логику после успешного логина:**
   ```typescript
   useEffect(() => {
     if (searchName && isSuccess) {
       if (foundCharacter) {
         // Сохранить ID персонажа
         localStorage.setItem('characterId', foundCharacter.id.toString());
         
         // Получить userId из персонажа (нужно будет добавить в Character тип)
         const userId = foundCharacter.userId; // или из другого источника
         
         // Проверить и создать персонажей, если нужно
         // Это можно сделать в Dashboard при загрузке
         
         navigate('/dashboard');
       } else {
         setError('Персонаж не найден');
         setSearchName(null);
       }
     }
   }, [foundCharacter, isSuccess, searchName, navigate]);
   ```

4. **Упростить JSX:**
   - Убрать условный рендеринг `{mode === 'create' ? ... : ...}`
   - Оставить только форму логина

**Итоговый вид страницы:**
- Видео фон
- Форма логина по центру (модальное окно с инпутом имени)
- Кнопка входа
- Кнопка музыки (если нужна)

---

## ЭТАП 5: Фронтенд - Компонент выбора персонажа

### Шаг 5.1: Создать компонент CharacterSelector ✅ ВЫПОЛНЕНО

**Файл:** `frontend/src/components/CharacterSelector.tsx`

**Функциональность:**
- Отображает 3 иконки персонажей справа
- Вертикальное расположение (сверху вниз)
- Прижаты к правому краю
- При клике разворачивается модальное окно

**Пропсы:**
```typescript
interface CharacterSelectorProps {
  characters: Character[]; // Массив персонажей пользователя
  selectedCharacterId: number | null;
  onSelectCharacter: (characterId: number) => void;
  userId: number;
}
```

**Структура:**
```tsx
<div style={{
  position: 'absolute',
  right: '20px', // Прижато к правому краю
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 1000,
}}>
  {['WARRIOR', 'ROGUE', 'MAGE'].map((classType) => {
    const character = characters.find(c => c.class === classType);
    const isSelected = selectedCharacterId === character?.id;
    
    return (
      <button
        key={classType}
        onClick={() => character && onSelectCharacter(character.id)}
        style={{
          width: isSelected ? '200px' : '100px', // Разворачивается при выборе
          height: '100px',
          // ... стили
        }}
      >
        <img src={getClassImage(classType)} />
      </button>
    );
  })}
</div>
```

**Логика:**
- Если персонаж не создан - иконка серая/неактивная
- Если персонаж создан - иконка активная
- При клике на активную иконку - вызывается `onSelectCharacter`
- При клике на неактивную - можно создать персонажа (или показать сообщение)

---

## ЭТАП 6: Фронтенд - Модальное окно персонажа

### Шаг 6.1: Создать компонент CharacterModal ✅ ВЫПОЛНЕНО

**Файл:** `frontend/src/components/CharacterModal.tsx`

**Функциональность:**
- Показывает характеристики выбранного персонажа
- Разворачивается влево от иконки
- Редактирование имени через инпут

**Пропсы:**
```typescript
interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; right: number }; // Позиция относительно иконки
  onUpdateName: (characterId: number, newName: string) => void;
}
```

**Структура:**
```tsx
{isOpen && character && (
  <div style={{
    position: 'absolute',
    right: position.right + 120, // Слева от иконки
    top: position.top,
    width: '400px',
    height: '600px',
    background: '#1a1a1a',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1001,
    // ... стили
  }}>
    {/* Имя с возможностью редактирования */}
    <div>
      <input
        value={character.name}
        onChange={(e) => setEditedName(e.target.value)}
        onBlur={() => onUpdateName(character.id, editedName)}
      />
    </div>
    
    {/* Класс */}
    <div>Класс: {character.class}</div>
    
    {/* Уровень */}
    <div>Уровень: {character.level}</div>
    
    {/* HP */}
    <div>
      HP: {character.currentHp} / {character.maxHp}
      <div style={{ /* прогресс бар */ }} />
    </div>
    
    {/* Выносливость */}
    <div>
      Выносливость: {character.stamina}
      <div style={{ /* прогресс бар */ }} />
    </div>
    
    {/* Характеристики */}
    <div>
      Сила: {character.strength}
      Ловкость: {character.agility}
      Интеллект: {character.intelligence}
    </div>
    
    {/* Золото */}
    <div>Золото: {character.gold}</div>
  </div>
)}
```

**Анимация:**
- При открытии: разворачивание слева направо (transform: translateX)
- При закрытии: сворачивание обратно

---

## ЭТАП 7: Фронтенд - Обновление Dashboard ✅ ВЫПОЛНЕНО

### Шаг 7.1: Добавить логику выбора персонажа ✅ ВЫПОЛНЕНО

**Файл:** `frontend/src/pages/Dashboard.tsx`

**Изменения:**

1. **Добавить состояние:**
   ```typescript
   const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
   const [characters, setCharacters] = useState<Character[]>([]);
   const [isModalOpen, setIsModalOpen] = useState(false);
   ```

2. **Получить userId:**
   - Из текущего персонажа (если есть в localStorage)
   - Или из API (нужно будет добавить endpoint для получения userId по characterId)

3. **Загрузить персонажей пользователя:**
   ```typescript
   const { data: userCharacters, isLoading: isLoadingCharacters } = useGetCharactersByUserIdQuery(userId, {
     skip: !userId,
   });

   useEffect(() => {
     if (userCharacters) {
       setCharacters(userCharacters);
       
       // Если персонажей нет - создать автоматически
       if (userCharacters.length === 0) {
         autoCreateCharacters(userId).then((created) => {
           setCharacters(created);
         });
       }
     }
   }, [userCharacters, userId]);
   ```

4. **Обработчик выбора персонажа:**
   ```typescript
   const handleSelectCharacter = (characterId: number) => {
     setSelectedCharacterId(characterId);
     localStorage.setItem('characterId', characterId.toString());
     setIsModalOpen(true);
   };
   ```

5. **Обновить логику загрузки данных:**
   - Использовать `selectedCharacterId` вместо `characterId` из localStorage
   - Если персонаж не выбран - не загружать данные

### Шаг 7.2: Добавить компоненты в Dashboard

**В JSX Dashboard добавить:**

1. **CharacterSelector справа:**
   ```tsx
   <CharacterSelector
     characters={characters}
     selectedCharacterId={selectedCharacterId}
     onSelectCharacter={handleSelectCharacter}
     userId={userId}
   />
   ```

2. **CharacterModal:**
   ```tsx
   <CharacterModal
     character={characters.find(c => c.id === selectedCharacterId) || null}
     isOpen={isModalOpen}
     onClose={() => setIsModalOpen(false)}
     position={{ top: 200, right: 20 }} // Позиция относительно иконки
     onUpdateName={handleUpdateName}
   />
   ```

3. **Условный рендеринг основного контента:**
   ```tsx
   {selectedCharacterId ? (
     // Весь существующий контент Dashboard
   ) : (
     <div>Выберите персонажа</div>
   )}
   ```

### Шаг 7.3: Переместить навигационные кнопки влево

**Текущее расположение:** Снизу по центру

**Новое расположение:** Слева вертикально

**Изменения:**
```tsx
<div style={{
  position: 'absolute',
  left: '20px', // Прижато к левому краю
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 1000,
}}>
  <Link to="/dungeon">...</Link>
  <Link to="/inventory">...</Link>
  <Link to="/blacksmith">...</Link>
  <Link to="/pvp">...</Link>
  <Link to="/specialization">...</Link>
  <Link to="/class-mentor">...</Link>
</div>
```

---

## ЭТАП 8: Дополнительные улучшения

### Шаг 8.1: Получение userId

**Проблема:** Нужно получить userId для загрузки персонажей пользователя.

**Варианты решения:**

1. **Добавить userId в Character тип:**
   - Убедиться, что бэкенд возвращает userId в Character
   - Использовать `character.userId` для получения всех персонажей

2. **Создать endpoint для получения userId по characterId:**
   ```typescript
   @Get('character/:id/user-id')
   async getUserIdByCharacterId(@Param('id') id: string): Promise<{ userId: number }> {
     const character = await this.characterService.findById(Number(id));
     return { userId: character.userId };
   }
   ```

3. **Использовать существующий endpoint:**
   - Если в Character уже есть userId - использовать его

**Рекомендация:** Вариант 1 - самый простой, если userId уже возвращается в Character.

### Шаг 8.2: Обработка первого входа

**Логика:**
1. Пользователь логинится по имени персонажа
2. Попадает на Dashboard
3. Dashboard проверяет: есть ли другие персонажи у этого пользователя
4. Если нет - создает 3 персонажа автоматически
5. Показывает иконки персонажей

**Реализация:**
```typescript
// В Dashboard при монтировании
useEffect(() => {
  const currentCharacterId = localStorage.getItem('characterId');
  if (currentCharacterId) {
    // Загрузить текущего персонажа
    const { data: currentCharacter } = useGetCharacterQuery(Number(currentCharacterId));
    
    if (currentCharacter) {
      const userId = currentCharacter.userId;
      
      // Загрузить всех персонажей пользователя
      const { data: allCharacters } = useGetCharactersByUserIdQuery(userId);
      
      if (allCharacters && allCharacters.length === 0) {
        // Создать 3 персонажа
        autoCreateCharacters(userId);
      }
    }
  }
}, []);
```

### Шаг 8.3: Визуальные состояния иконок

**Состояния:**
1. **Не создан:** Серая иконка, неактивная
2. **Создан, не выбран:** Нормальная иконка, прижата к краю
3. **Создан, выбран:** Иконка развернута, модальное окно открыто

**Стили:**
```typescript
const getIconStyle = (character: Character | undefined, isSelected: boolean) => ({
  width: isSelected ? '200px' : '100px',
  height: '100px',
  opacity: character ? 1 : 0.5,
  filter: character ? 'none' : 'grayscale(100%)',
  transition: 'all 0.3s ease',
  transform: isSelected ? 'translateX(-100px)' : 'translateX(0)',
});
```

---

## ЭТАП 9: Тестирование

### Шаг 9.1: Тестирование бэкенда

1. **Тест создания нескольких персонажей:**
   - Создать пользователя
   - Создать 3 персонажа разных классов
   - Проверить, что все сохраняются

2. **Тест автосоздания:**
   - Вызвать `/character/auto-create/:userId`
   - Проверить, что создаются 3 персонажа
   - Проверить, что повторный вызов не создает дубликаты

3. **Тест получения списка:**
   - Вызвать `/character/user/:userId`
   - Проверить, что возвращаются все персонажи пользователя

### Шаг 9.2: Тестирование фронтенда

1. **Тест страницы входа:**
   - Ввести имя существующего персонажа
   - Проверить редирект на Dashboard

2. **Тест Dashboard:**
   - Проверить отображение 3 иконок справа
   - Проверить открытие модального окна при клике
   - Проверить переключение между персонажами

3. **Тест автосоздания:**
   - Залогиниться новым пользователем
   - Проверить, что создаются 3 персонажа

---

## ЭТАП 10: Финальные доработки

### Шаг 10.1: Обработка ошибок

- Обработка ошибок при создании персонажей
- Обработка ошибок при загрузке списка
- Показ сообщений об ошибках пользователю

### Шаг 10.2: Оптимизация

- Кэширование списка персонажей
- Оптимизация запросов (не загружать данные, если персонаж не выбран)
- Ленивая загрузка модального окна

### Шаг 10.3: Анимации

- Плавное разворачивание модального окна
- Плавное переключение между персонажами
- Анимация при создании нового персонажа

---

## Чеклист выполнения

### Бэкенд:
- [ ] Обновлена Prisma схема
- [ ] Создана и применена миграция
- [ ] Добавлен метод `findByUserId` в CharacterService
- [ ] Добавлен метод `autoCreateCharactersForUser` в CharacterService
- [ ] Добавлен метод `updateName` в CharacterService
- [ ] Обновлен метод `create` с проверкой лимита
- [ ] Добавлен эндпоинт `GET /character/user/:userId`
- [ ] Добавлен эндпоинт `POST /character/auto-create/:userId`
- [ ] Добавлен эндпоинт `PUT /character/:id/name`
- [ ] Протестированы все эндпоинты

### Фронтенд:
- [ ] Добавлены методы в characterApi
- [ ] Упрощена страница CreateCharacter (только логин)
- [ ] Создан компонент CharacterSelector
- [ ] Создан компонент CharacterModal
- [ ] Обновлен Dashboard с логикой выбора персонажа
- [ ] Перемещены навигационные кнопки влево
- [ ] Реализована логика автосоздания персонажей
- [ ] Реализовано редактирование имени персонажа
- [ ] Протестирован весь функционал

---

## Примечания

1. **Временные имена персонажей:** При автосоздании можно использовать временные имена типа "Воин1234567890" (с timestamp), которые пользователь потом изменит.

2. **Порядок персонажей:** Персонажи отображаются в порядке: Воин, Разбойник, Маг (сверху вниз).

3. **Размеры компонентов:** Все размеры должны быть адаптированы под фиксированное разрешение 1366x768.

4. **Z-index:** 
   - Иконки персонажей: 1000
   - Модальное окно: 1001
   - Навигационные кнопки: 1000

5. **Локализация:** Все тексты должны быть на русском языке.

---

## Порядок выполнения

Рекомендуемый порядок:
1. ЭТАП 1 (БД) - основа для всего
2. ЭТАП 2 (Бэкенд API) - нужно для фронтенда
3. ЭТАП 3 (Фронтенд API) - связующее звено
4. ЭТАП 4 (Страница входа) - можно делать параллельно
5. ЭТАП 5-7 (Dashboard компоненты) - последовательно
6. ЭТАП 8-10 (Доработки) - финализация

---

**Готово к использованию!** Этот план можно использовать как пошаговую инструкцию для реализации всей функциональности.

