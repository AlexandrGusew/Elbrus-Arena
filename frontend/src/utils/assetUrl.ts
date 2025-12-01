/**
 * Утилита для генерации URL медиа-файлов из локальной папки asset
 *
 * Использование:
 * import { getAssetUrl } from '@/utils/assetUrl';
 * const videoUrl = getAssetUrl('createCharacter/animatedBackground.mp4');
 */

/**
 * Опции для генерации URL
 */
interface AssetUrlOptions {
  /** Размер изображения (для будущей оптимизации) */
  size?: 'thumbnail' | 'medium' | 'full';
  /** Формат файла (для будущей оптимизации) */
  format?: 'original' | 'webp';
}

/**
 * Генерирует URL для медиа-файла из локальной папки asset
 *
 * @param assetPath - путь к файлу в папке asset (например, 'dashboard/mainCityBackground.mp4')
 * @param options - опции генерации URL
 * @returns полный URL к файлу
 *
 * @example
 * ```typescript
 * // Простое использование
 * const url = getAssetUrl('createCharacter/animatedBackground.mp4');
 *
 * // С опциями
 * const url = getAssetUrl('createCharacter/warrior (1).png', { size: 'thumbnail' });
 * ```
 */
export function getAssetUrl(assetPath: string, options: AssetUrlOptions = {}): string {
  // Всегда используем локальные assets из папки asset
  return getLocalAssetUrl(assetPath);
}

/**
 * Генерирует URL для локального файла (для dev режима)
 */
const assetModules = import.meta.glob('../../asset/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

function getLocalAssetUrl(assetPath: string): string {
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const key = `../../asset/${cleanPath}`;
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
 * preloadAsset('createCharacter/animatedBackground.mp4', 'video');
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
 *   { path: 'createCharacter/warrior (1).png', type: 'image' },
 *   { path: 'createCharacter/backgroundIntro2.mp3', type: 'audio' }
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
 *   const videoUrl = useAssetUrl('createCharacter/animatedBackground.mp4');
 *   return <video src={videoUrl} />;
 * }
 * ```
 */
export function useAssetUrl(assetPath: string, options?: AssetUrlOptions): string {
  return getAssetUrl(assetPath, options);
}

/**
 * Проверяет доступность локального файла
 * Полезно для healthcheck или диагностики
 */
export async function checkAssetHealth(assetPath: string): Promise<boolean> {
  try {
    const url = getLocalAssetUrl(assetPath);
    if (!url) return false;
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('[assetUrl] Asset health check failed:', error);
    return false;
  }
}

// Экспорт конфигурации для использования в других модулях
export const assetConfig = {
  useLocalAssets: true,
} as const;

/**
 * Debug информация для разработки
 */
if (import.meta.env.DEV) {
  console.log('[assetUrl] Using local assets from /asset folder');
}
