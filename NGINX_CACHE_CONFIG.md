# Настройка Cache-Control Headers в Nginx для MinIO

Эти настройки добавят правильные Cache-Control headers для статических файлов из MinIO, что позволит браузерам агрессивно кэшировать медиа-файлы.

## 1. Настройка для прямого доступа к MinIO (если используется)

Если у вас есть прямой проксирующий location для MinIO в nginx, добавьте:

```nginx
location /minio/ {
    proxy_pass http://localhost:9000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Cache-Control headers для статических файлов
    location ~ \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:9000;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location ~ \.(mp4|webm|avi|mov)$ {
        proxy_pass http://localhost:9000;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location ~ \.(mp3|wav|ogg|m4a)$ {
        proxy_pass http://localhost:9000;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 2. Альтернативный вариант: Настройка CORS и Cache в MinIO

Если файлы загружаются напрямую из MinIO без прокси, настройте MinIO:

### minio-cors.json
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://nightfall-arena.ru",
        "http://localhost:5173",
        "http://localhost:3000"
      ],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": [
        "ETag",
        "Cache-Control",
        "Content-Type",
        "Content-Length"
      ]
    }
  ]
}
```

### Применение CORS в MinIO:
```bash
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc admin config set myminio api cors_allow_origin=https://nightfall-arena.ru
```

## 3. Настройка Cache для статических файлов фронтенда

В основной конфигурации nginx для фронтенда:

```nginx
server {
    listen 80;
    server_name nightfall-arena.ru;

    # ... остальные настройки ...

    # Кэширование статических файлов приложения
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Service Worker должен проверяться на каждом запросе
    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # HTML файлы не кэшируем
    location ~* \.html$ {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

## 4. Оптимизация nginx для больших файлов

Добавьте в http блок nginx.conf:

```nginx
http {
    # Увеличиваем размер буфера для больших файлов
    client_body_buffer_size 128k;
    client_max_body_size 100M;

    # Настройки кэша прокси (если используется прокси к MinIO)
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=minio_cache:10m max_size=10g
                     inactive=30d use_temp_path=off;

    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_valid 200 30d;
    proxy_cache_use_stale error timeout invalid_header updating;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";
}
```

## 5. Проверка настроек

После применения настроек:

```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка nginx
sudo systemctl reload nginx

# Проверка headers
curl -I https://nightfall-arena.ru/some-static-file.png
```

Должны увидеть заголовки:
```
Cache-Control: public, immutable
Expires: [дата через 30 дней]
```

## 6. Мониторинг размера кэша

Проверить размер кэша nginx:
```bash
du -sh /var/cache/nginx
```

Очистить кэш если нужно:
```bash
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

## Результат

После применения этих настроек:
- ✅ Браузеры будут кэшировать медиа на 30 дней
- ✅ Service Worker будет работать с кэшированными файлами
- ✅ Повторные посещения станут практически мгновенными
- ✅ Трафик к MinIO снизится на 90%+
