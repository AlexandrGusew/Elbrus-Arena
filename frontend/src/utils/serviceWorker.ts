/**
 * Утилиты для работы с Service Worker
 * Управление кэшированием медиа-файлов
 */

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Регистрация Service Worker
 */
export async function registerServiceWorker(config?: ServiceWorkerConfig): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported');
    return;
  }

  // Регистрируем только в production
  if (import.meta.env.DEV) {
    console.log('[SW] Service Worker disabled in development');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered successfully');

    // Проверка обновлений
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Есть новая версия
          console.log('[SW] New version available');
          config?.onUpdate?.(registration);
        } else if (newWorker.state === 'activated') {
          // Первая установка
          console.log('[SW] Service Worker activated');
          config?.onSuccess?.(registration);
        }
      });
    });

    // Автоматическая проверка обновлений каждые 60 минут
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    config?.onError?.(error as Error);
  }
}

/**
 * Отмена регистрации Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[SW] Unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[SW] Unregister failed:', error);
    return false;
  }
}

/**
 * Предзагрузка критических ресурсов
 * Вызывается после загрузки приложения для кэширования важных файлов
 */
export async function precacheCriticalAssets(urls: string[]): Promise<void> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.log('[SW] No active Service Worker to precache');
    return;
  }

  try {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls,
    });

    console.log(`[SW] Precaching ${urls.length} critical assets`);
  } catch (error) {
    console.error('[SW] Precache failed:', error);
  }
}

/**
 * Очистка кэша
 */
export async function clearCache(): Promise<void> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.log('[SW] No active Service Worker');
    return;
  }

  try {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
    });

    console.log('[SW] Cache cleared');
  } catch (error) {
    console.error('[SW] Clear cache failed:', error);
  }
}

/**
 * Получение размера кэша
 */
export async function getCacheSize(): Promise<number> {
  if (!('caches' in window)) {
    return 0;
  }

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error('[SW] Get cache size failed:', error);
    return 0;
  }
}

/**
 * Форматирование размера в человеко-читаемый формат
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Проверка, активен ли Service Worker
 */
export function isServiceWorkerActive(): boolean {
  return 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
}
