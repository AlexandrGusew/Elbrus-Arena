# Пример миграции кода на MinIO

## ДО миграции (статические импорты)

```typescript
// frontend/src/pages/CreateCharacter.tsx (СТАРАЯ ВЕРСИЯ)
import React, { useState } from 'react';
import backgroundVideo from '../assets/choosePlayer/animatedBackground.mp4';
import backgroundMusic from '../assets/choosePlayer/backgroundIntro2.mp3';
import warriorImg from '../assets/choosePlayer/warrior (1).png';
import mageImg from '../assets/choosePlayer/mage (1).png';
import rogueImg from '../assets/choosePlayer/rogue (1).png';

export function CreateCharacter() {
  return (
    <div>
      {/* Фоновое видео */}
      <video autoPlay loop muted>
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Фоновая музыка */}
      <audio autoPlay loop>
        <source src={backgroundMusic} type="audio/mp3" />
      </audio>

      {/* Картинки персонажей */}
      <img src={warriorImg} alt="Warrior" />
      <img src={mageImg} alt="Mage" />
      <img src={rogueImg} alt="Rogue" />
    </div>
  );
}
```

**Проблемы:**
- ❌ Все 21MB видео + музыка + PNG включаются в bundle
- ❌ Медленная первая загрузка
- ❌ Нельзя обновить медиа без пересборки

---

## ПОСЛЕ миграции (динамические URL из MinIO)

```typescript
// frontend/src/pages/CreateCharacter.tsx (НОВАЯ ВЕРСИЯ)
import React, { useState, useEffect } from 'react';
import { getAssetUrl, preloadAssets } from '../utils/assetUrl';

export function CreateCharacter() {
  // Предзагрузка критичных ресурсов при монтировании компонента
  useEffect(() => {
    preloadAssets([
      { path: 'choosePlayer/warrior (1).png', type: 'image' },
      { path: 'choosePlayer/mage (1).png', type: 'image' },
      { path: 'choosePlayer/rogue (1).png', type: 'image' },
    ]);
  }, []);

  return (
    <div>
      {/* Фоновое видео из MinIO */}
      <video autoPlay loop muted>
        <source
          src={getAssetUrl('choosePlayer/animatedBackground.mp4')}
          type="video/mp4"
        />
      </video>

      {/* Фоновая музыка из MinIO */}
      <audio autoPlay loop>
        <source
          src={getAssetUrl('choosePlayer/backgroundIntro2.mp3')}
          type="audio/mp3"
        />
      </audio>

      {/* Картинки персонажей из MinIO */}
      <img src={getAssetUrl('choosePlayer/warrior (1).png')} alt="Warrior" />
      <img src={getAssetUrl('choosePlayer/mage (1).png')} alt="Mage" />
      <img src={getAssetUrl('choosePlayer/rogue (1).png')} alt="Rogue" />
    </div>
  );
}
```

**Преимущества:**
- ✅ Bundle без медиа (~500KB вместо ~25MB)
- ✅ Медиа грузятся параллельно из MinIO
- ✅ Можно обновить картинку в MinIO без пересборки
- ✅ Кеширование на 30 дней

---

## Вариант с React хуком

```typescript
// frontend/src/pages/CreateCharacter.tsx (С ХУКОМ)
import React from 'react';
import { useAssetUrl } from '../utils/assetUrl';

export function CreateCharacter() {
  // Использование хука для получения URL
  const backgroundVideo = useAssetUrl('choosePlayer/animatedBackground.mp4');
  const backgroundMusic = useAssetUrl('choosePlayer/backgroundIntro2.mp3');
  const warriorImg = useAssetUrl('choosePlayer/warrior (1).png');
  const mageImg = useAssetUrl('choosePlayer/mage (1).png');
  const rogueImg = useAssetUrl('choosePlayer/rogue (1).png');

  return (
    <div>
      <video autoPlay loop muted>
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      <audio autoPlay loop>
        <source src={backgroundMusic} type="audio/mp3" />
      </audio>

      <img src={warriorImg} alt="Warrior" />
      <img src={mageImg} alt="Mage" />
      <img src={rogueImg} alt="Rogue" />
    </div>
  );
}
```

---

## Пример с lazy loading и suspense

```typescript
// frontend/src/pages/CreateCharacter.tsx (С LAZY LOADING)
import React, { Suspense, lazy } from 'react';
import { getAssetUrl } from '../utils/assetUrl';

// Lazy компонент для фонового видео
const BackgroundVideo = lazy(() => import('../components/BackgroundVideo'));

export function CreateCharacter() {
  return (
    <div>
      {/* Показываем placeholder пока видео загружается */}
      <Suspense fallback={<div className="video-placeholder">Загрузка...</div>}>
        <BackgroundVideo
          src={getAssetUrl('choosePlayer/animatedBackground.mp4')}
        />
      </Suspense>

      {/* Остальной контент может загружаться сразу */}
      <CharacterSelector />
    </div>
  );
}
```

---

## Миграция DifficultySelector.tsx

### ДО:
```typescript
// frontend/src/components/battle/DifficultySelector.tsx (СТАРАЯ)
import easyBadge from '../../assets/enterDungeon/dungeons/easy/easy_level_badge.png';
import mediumBadge from '../../assets/enterDungeon/dungeons/medium/medium_level_badge.png';
import hardBadge from '../../assets/enterDungeon/dungeons/hard/hard_level_badge.png';

export function DifficultySelector() {
  return (
    <div>
      <img src={easyBadge} alt="Easy" />
      <img src={mediumBadge} alt="Medium" />
      <img src={hardBadge} alt="Hard" />
    </div>
  );
}
```

### ПОСЛЕ:
```typescript
// frontend/src/components/battle/DifficultySelector.tsx (НОВАЯ)
import { getAssetUrl } from '../../utils/assetUrl';

export function DifficultySelector() {
  const badges = {
    easy: getAssetUrl('enterDungeon/dungeons/easy/easy_level_badge.png'),
    medium: getAssetUrl('enterDungeon/dungeons/medium/medium_level_badge.png'),
    hard: getAssetUrl('enterDungeon/dungeons/hard/hard_level_badge.png'),
  };

  return (
    <div>
      <img src={badges.easy} alt="Easy" />
      <img src={badges.medium} alt="Medium" />
      <img src={badges.hard} alt="Hard" />
    </div>
  );
}
```

---

## Создание переиспользуемого компонента

```typescript
// frontend/src/components/MinIOImage.tsx
import React from 'react';
import { getAssetUrl } from '../utils/assetUrl';

interface MinIOImageProps {
  path: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function MinIOImage({ path, alt, className, onLoad, onError }: MinIOImageProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const src = getAssetUrl(path);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  return (
    <div className={className}>
      {loading && <div className="skeleton-loader" />}
      {error && <div className="image-error">Ошибка загрузки</div>}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
}
```

Использование:
```typescript
<MinIOImage
  path="choosePlayer/warrior (1).png"
  alt="Warrior"
  className="character-image"
  onLoad={() => console.log('Loaded!')}
/>
```

---

## Постепенная миграция (рекомендуется)

### Этап 1: Миграция видео (самые большие файлы)
- CreateCharacter.tsx - animatedBackground.mp4 (21MB)
- PvP.tsx - pvpArena2.mp4 (15MB)
- Dashboard.tsx - mainCityBackground.mp4 (6.6MB)

### Этап 2: Миграция фоновых изображений
- Все background.png и level_background.png

### Этап 3: Миграция музыки
- Все .mp3 файлы

### Этап 4: Остальные изображения

---

## Проверка работоспособности

```typescript
// frontend/src/utils/assetUrl.test.ts
import { getAssetUrl, checkMinioHealth } from './assetUrl';

// Проверка генерации URL
console.log(getAssetUrl('choosePlayer/warrior.png'));
// Ожидается: https://nightfall-arena.ru/minio/choosePlayer/warrior.png

// Проверка доступности MinIO
checkMinioHealth().then(isHealthy => {
  console.log('MinIO доступен:', isHealthy);
});
```

---

## FAQ

### Q: Что делать если MinIO недоступен?
A: Утилита автоматически вернется к локальным файлам (fallback). Убедитесь, что в dev режиме файлы доступны локально.

### Q: Как обновить картинку в production?
A: Просто загрузите новый файл в MinIO с тем же именем. Nginx кеш обновится автоматически.

### Q: Нужно ли мигрировать все сразу?
A: Нет! Можно мигрировать постепенно, начиная с самых больших файлов.

### Q: Как откатиться обратно?
A: Установите `VITE_USE_MINIO=false` в .env - утилита вернется к локальным файлам.

---

**Следующий шаг:** Начните с миграции CreateCharacter.tsx или другой страницы с большими медиа!
