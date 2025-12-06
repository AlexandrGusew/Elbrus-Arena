/**
 * Service Worker для кэширования медиа-файлов из MinIO
 * Стратегия: Cache First с fallback на Network
 */

const CACHE_NAME = 'nightfall-arena-v1';
const MINIO_CACHE = 'minio-assets-v1';

// Критические ресурсы для предзагрузки
const CRITICAL_ASSETS = [
  // Добавим сюда критические ресурсы после установки
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching critical assets');
      return cache.addAll(CRITICAL_ASSETS);
    }).then(() => {
      // Активируем новый SW сразу
      return self.skipWaiting();
    })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удаляем старые кэши
          if (cacheName !== CACHE_NAME && cacheName !== MINIO_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Берем контроль над всеми клиентами
      return self.clients.claim();
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Проверяем, это запрос к MinIO?
  const isMinIORequest = url.hostname.includes('178.72.139.236') ||
                         url.hostname.includes('nightfall-arena.ru') ||
                         url.pathname.includes('/elbrus-arena-assets/');

  // Проверяем, это медиа-файл?
  const isMediaFile = /\.(png|jpg|jpeg|gif|svg|webp|mp4|webm|mp3|wav|ogg)$/i.test(url.pathname);

  // Если это медиа из MinIO - применяем Cache First
  if (isMinIORequest && isMediaFile) {
    event.respondWith(handleMinIORequest(request));
    return;
  }

  // Для API запросов - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Для остального - Network First с fallback на Cache
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      // Для навигации - возвращаем index.html
      if (request.mode === 'navigate') {
        const indexCache = await caches.match('/index.html');
        if (indexCache) return indexCache;
      }

      // Для остальных - 404
      return new Response('Not found', { status: 404 });
    })
  );
});

/**
 * Cache First стратегия для MinIO медиа
 * Сначала ищем в кэше, если нет - загружаем и кэшируем
 */
async function handleMinIORequest(request) {
  try {
    // Пробуем найти в кэше
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Fetching from network:', request.url);

    // Загружаем из сети
    const networkResponse = await fetch(request);

    // Кэшируем только успешные ответы
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(MINIO_CACHE);

      // Клонируем ответ, так как его можно прочитать только один раз
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cached:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);

    // Пробуем вернуть из кэша в случае ошибки
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Возвращаем заглушку или ошибку
    return new Response('Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network First стратегия для API
 * Сначала пробуем сеть, если не получается - берем из кэша
 */
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);

    // Кэшируем GET запросы к API
    if (request.method === 'GET' && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] API network failed, trying cache');

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    // Принудительное кэширование URL'ов
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(MINIO_CACHE).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Очистка кэша
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
