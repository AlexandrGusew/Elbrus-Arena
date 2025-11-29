/**
 * Утилита для генерации URL медиа-файлов из MinIO
 *
 * Использование:
 * import { getAssetUrl } from '@/utils/assetUrl';
 * const videoUrl = getAssetUrl('choosePlayer/animatedBackground.mp4');
 */

// Конфигурация MinIO из переменных окружения
const MINIO_URL = import.meta.env.VITE_MINIO_URL || '';
const MINIO_BUCKET = import.meta.env.VITE_MINIO_BUCKET || 'elbrus-arena-assets';
const USE_MINIO = import.meta.env.VITE_USE_MINIO === 'true';

/**
 * Опции для генерации URL
 */
interface AssetUrlOptions {
  /** Размер изображения (для будущей оптимизации) */
  size?: 'thumbnail' | 'medium' | 'full';
  /** Формат файла (для будущей оптимизации) */
  format?: 'original' | 'webp';
  /** Принудительно использовать MinIO даже если флаг отключен */
  forceMinio?: boolean;
}

/**
 * Генерирует URL для медиа-файла
 *
 * @param assetPath - путь к файлу относительно assets/ (например, 'choosePlayer/warrior.png')
 * @param options - опции генерации URL
 * @returns полный URL к файлу
 *
 * @example
 * ```typescript
 * // Простое использование
 * const url = getAssetUrl('choosePlayer/animatedBackground.mp4');
 *
 * // С опциями
 * const url = getAssetUrl('choosePlayer/warrior.png', { size: 'thumbnail' });
 * ```
 */
export function getAssetUrl(assetPath: string, options: AssetUrlOptions = {}): string {
  const { forceMinio = false } = options;

  // Если MinIO включен или принудительно запрошен
  if (USE_MINIO || forceMinio) {
    if (!MINIO_URL) {
      console.warn('[assetUrl] VITE_MINIO_URL not configured, falling back to local assets');
      return getLocalAssetUrl(assetPath);
    }

    // Убираем leading slash если есть
    const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

    // Кодируем каждую часть пути (для обработки пробелов и спецсимволов)
    // Разбиваем по /, кодируем каждую часть, собираем обратно
    const encodedPath = cleanPath
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/');

    // Формируем URL к MinIO
    // Формат: http://minio.example.com/bucket-name/path/to/file.mp4
    const url = `${MINIO_URL}/${MINIO_BUCKET}/${encodedPath}`;

    return url;
  }

  // Fallback на локальные assets (для development или если MinIO отключен)
  return getLocalAssetUrl(assetPath);
}

/**
 * Генерирует URL для локального файла (для dev режима)
 */
const assetModules = import.meta.glob('../assets/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

function getLocalAssetUrl(assetPath: string): string {
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const key = `../assets/${cleanPath}`;
  const url = assetModules[key];

  if (!url) {
    console.warn(`[assetUrl] Asset not found: ${cleanPath}`);
    return '';
  }

  return url as string;
}

/**
 * Предзагружает медиа-файл
 * Полезно для критичных ресурсов, которые нужны сразу
 *
 * @param assetPath - путь к файлу
 * @param type - тип ресурса ('video' | 'image' | 'audio')
 *
 * @example
 * ```typescript
 * // В компоненте или при инициализации
 * preloadAsset('choosePlayer/animatedBackground.mp4', 'video');
 * ```
 */
export function preloadAsset(
  assetPath: string,
  type: 'video' | 'image' | 'audio' = 'image'
): void {
  const url = getAssetUrl(assetPath);

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;

  document.head.appendChild(link);
}

/**
 * Предзагружает несколько медиа-файлов
 *
 * @example
 * ```typescript
 * preloadAssets([
 *   { path: 'choosePlayer/warrior.png', type: 'image' },
 *   { path: 'choosePlayer/backgroundIntro2.mp3', type: 'audio' }
 * ]);
 * ```
 */
export function preloadAssets(
  assets: Array<{ path: string; type: 'video' | 'image' | 'audio' }>
): void {
  assets.forEach(({ path, type }) => preloadAsset(path, type));
}

/**
 * Хук для использования в React компонентах
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const videoUrl = useAssetUrl('choosePlayer/animatedBackground.mp4');
 *   return <video src={videoUrl} />;
 * }
 * ```
 */
export function useAssetUrl(assetPath: string, options?: AssetUrlOptions): string {
  return getAssetUrl(assetPath, options);
}

/**
 * Проверяет доступность MinIO
 * Полезно для healthcheck или диагностики
 */
export async function checkMinioHealth(): Promise<boolean> {
  if (!USE_MINIO || !MINIO_URL) {
    return false;
  }

  try {
    // Пробуем загрузить любой известный файл для проверки доступности
    const testUrl = `${MINIO_URL}/${MINIO_BUCKET}/`;
    const response = await fetch(testUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('[assetUrl] MinIO health check failed:', error);
    return false;
  }
}

// Экспорт конфигурации для использования в других модулях
export const assetConfig = {
  minioUrl: MINIO_URL,
  minioBucket: MINIO_BUCKET,
  useMinio: USE_MINIO,
} as const;

/**
 * Debug информация для разработки
 */
if (import.meta.env.DEV) {
  console.log('[assetUrl] Configuration:', {
    MINIO_URL,
    MINIO_BUCKET,
    USE_MINIO,
  });
}
