# MinIO Quick Start - Быстрый старт за 15 минут

## ⚡ Быстрая настройка (TL;DR)

```bash
# 1. Установить MinIO Client на сервере
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# 2. Настроить подключение (замените ACCESS_KEY и SECRET_KEY)
mc alias set myminio http://localhost:9000 YOUR_ACCESS_KEY YOUR_SECRET_KEY

# 3. Создать bucket и настроить доступ
mc mb myminio/elbrus-arena-assets
mc anonymous set download myminio/elbrus-arena-assets

# 4. Загрузить медиа (на локальной машине или сервере где есть assets)
cd /path/to/project
node scripts/upload-assets-to-minio.js

# 5. Обновить .env на сервере
echo "VITE_MINIO_URL=https://nightfall-arena.ru/minio" >> .env
echo "VITE_MINIO_BUCKET=elbrus-arena-assets" >> .env
echo "VITE_USE_MINIO=true" >> .env

# 6. Обновить nginx конфигурацию (см. minio-nginx.conf)
sudo nano /etc/nginx/sites-available/nightfall-arena.ru
# Добавить location /minio/ блок
sudo nginx -t && sudo systemctl reload nginx

# 7. Пересобрать и перезапустить контейнеры
docker compose build
docker compose up -d

# 8. Проверить работу
curl https://nightfall-arena.ru/minio/choosePlayer/warrior.png
```

---

## 📋 Детальные инструкции

### Шаг 1: Проверка MinIO на сервере

Проверьте что MinIO запущен:

```bash
# Проверить процесс MinIO
ps aux | grep minio

# Проверить порты
sudo netstat -tlnp | grep 9000

# Или через docker если MinIO в контейнере
docker ps | grep minio
```

Если MinIO не установлен, установите:

```bash
# Скачать MinIO server
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Создать директорию для данных
sudo mkdir -p /data/minio

# Запустить MinIO (создайте systemd service для production)
MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=your-secret-password minio server /data/minio --console-address ":9001"
```

Создайте systemd service:

```bash
sudo nano /etc/systemd/system/minio.service
```

```ini
[Unit]
Description=MinIO
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target

[Service]
Type=notify
WorkingDirectory=/usr/local/
User=minio
Group=minio

Environment="MINIO_ROOT_USER=admin"
Environment="MINIO_ROOT_PASSWORD=your-secret-password-min-8-chars"

ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"

Restart=always
LimitNOFILE=65536
TasksMax=infinity
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
```

```bash
# Создать пользователя minio
sudo useradd -r minio-user
sudo chown minio-user:minio-user /data/minio

# Запустить сервис
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio
sudo systemctl status minio
```

### Шаг 2: Загрузка медиа в MinIO

**Вариант A: Локально (если assets есть на локальной машине)**

```bash
# На локальной машине
cd /path/to/elbrus-arena-project

# Установить Node.js зависимости если нужно
npm install

# Настроить подключение к удаленному MinIO
mc alias set prod-minio https://nightfall-arena.ru:9000 admin your-password

# Запустить скрипт загрузки
node scripts/upload-assets-to-minio.js \
  --alias prod-minio \
  --bucket elbrus-arena-assets
```

**Вариант B: На сервере (если assets уже есть на сервере)**

```bash
# Скопировать assets на сервер
scp -r frontend/src/assets root@your-server:/tmp/assets

# На сервере
cd /var/www/app
mc cp --recursive /tmp/assets/ myminio/elbrus-arena-assets/
```

**Вариант C: Через docker (если работаете с docker)**

```bash
# Примонтировать volume и скопировать
docker run --rm \
  -v /tmp/assets:/assets \
  -v /data/minio:/data \
  minio/mc cp --recursive /assets /data/elbrus-arena-assets/
```

### Шаг 3: Проверка загруженных файлов

```bash
# Список файлов в bucket
mc ls myminio/elbrus-arena-assets/

# Рекурсивный список
mc ls -r myminio/elbrus-arena-assets/ | head -20

# Проверить размер bucket
mc du myminio/elbrus-arena-assets/

# Проверить доступность через curl
curl http://localhost:9000/elbrus-arena-assets/choosePlayer/warrior.png -I
```

Ожидаемый вывод:
```
HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 964000
...
```

### Шаг 4: Настройка Nginx

Добавьте блок в `/etc/nginx/sites-available/nightfall-arena.ru`:

```nginx
server {
    listen 80;
    server_name nightfall-arena.ru;

    # ... existing locations ...

    # MinIO proxy
    location /minio/ {
        proxy_pass http://localhost:9000/elbrus-arena-assets/;
        proxy_set_header Host $host;

        # Кеширование
        expires 30d;
        add_header Cache-Control "public, immutable";

        # CORS
        add_header Access-Control-Allow-Origin * always;
    }
}
```

Проверить и перезагрузить:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Проверить доступность через nginx:

```bash
curl https://nightfall-arena.ru/minio/choosePlayer/warrior.png -I
```

### Шаг 5: Обновление Docker

Обновите `.dockerignore` для исключения медиа (опционально):

```bash
echo "# Exclude large media files (served from MinIO)" >> .dockerignore
echo "frontend/src/assets/**/*.mp4" >> .dockerignore
echo "frontend/src/assets/**/*.mp3" >> .dockerignore
```

Пересоберите образы:

```bash
cd /var/www/app
git pull origin dpl
docker compose build --no-cache
docker compose up -d
```

### Шаг 6: Проверка работы

Откройте приложение в браузере и проверьте:

1. **DevTools Network tab** - медиа должны грузиться с `/minio/...`
2. **Консоль браузера** - не должно быть ошибок 404
3. **Размер bundle** - должен уменьшиться с ~5MB до ~500KB

Проверка из консоли браузера:

```javascript
// Откройте DevTools Console на сайте и выполните:
import { getAssetUrl, assetConfig } from './utils/assetUrl';

console.log('Config:', assetConfig);
console.log('Test URL:', getAssetUrl('choosePlayer/warrior.png'));

// Проверить загрузку
fetch(getAssetUrl('choosePlayer/warrior.png'))
  .then(r => console.log('Status:', r.status, r.statusText))
  .catch(e => console.error('Error:', e));
```

---

## 🔍 Troubleshooting

### Проблема 1: CORS ошибки

**Симптомы:**
```
Access to fetch at 'https://nightfall-arena.ru/minio/...' from origin
'https://nightfall-arena.ru' has been blocked by CORS policy
```

**Решение:**

```bash
# Настроить CORS в MinIO
cat > /tmp/cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
}
EOF

mc anonymous set-json /tmp/cors.json myminio/elbrus-arena-assets
```

Или добавить CORS headers в nginx (см. minio-nginx.conf).

### Проблема 2: 404 Not Found

**Симптомы:**
```
GET https://nightfall-arena.ru/minio/choosePlayer/warrior.png 404
```

**Решение:**

```bash
# Проверить что файл загружен
mc ls myminio/elbrus-arena-assets/choosePlayer/

# Проверить доступность напрямую
curl http://localhost:9000/elbrus-arena-assets/choosePlayer/warrior.png -I

# Проверить nginx прокси
curl -H "Host: nightfall-arena.ru" http://localhost/minio/choosePlayer/warrior.png -I

# Проверить логи nginx
sudo tail -f /var/log/nginx/error.log
```

### Проблема 3: Медленная загрузка

**Симптомы:** Медиа грузятся очень медленно

**Решение:**

```bash
# 1. Включить nginx кеширование (см. minio-nginx.conf)

# 2. Увеличить буферы в nginx
proxy_buffering on;
proxy_buffer_size 16k;
proxy_buffers 8 16k;

# 3. Проверить ресурсы сервера
top
df -h
free -m

# 4. Оптимизировать файлы (уменьшить размер видео)
# Используйте ffmpeg для сжатия
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2M output.mp4
```

### Проблема 4: Переменные окружения не работают

**Симптомы:** `VITE_MINIO_URL` undefined

**Решение:**

```bash
# Убедитесь что переменные в .env БЕЗ кавычек
VITE_MINIO_URL=https://nightfall-arena.ru/minio
VITE_USE_MINIO=true

# Пересоберите Docker образ (важно!)
docker compose build --no-cache frontend
docker compose up -d
```

---

## ✅ Checklist финальной проверки

После завершения установки проверьте:

- [ ] MinIO запущен и доступен (http://localhost:9000)
- [ ] Bucket создан и публичен
- [ ] Медиа загружены (проверено через `mc ls`)
- [ ] Nginx проксирует /minio/ на MinIO
- [ ] CORS настроен
- [ ] Переменные окружения установлены в .env
- [ ] Docker образы пересобраны
- [ ] Сайт работает и показывает медиа
- [ ] Network tab показывает загрузку с /minio/
- [ ] Нет ошибок в консоли браузера
- [ ] Размер bundle уменьшился

---

## 📊 Ожидаемые результаты

### До MinIO:
```
Docker образ frontend: ~150MB
Bundle size: ~5MB
Первая загрузка: ~8s
Время сборки: 3-5 минут
```

### После MinIO:
```
Docker образ frontend: ~15MB (↓ 90%)
Bundle size: ~500KB (↓ 90%)
Первая загрузка: ~2s (↓ 75%)
Время сборки: 30-60 секунд (↓ 80%)
```

---

## 🎯 Следующие шаги

1. **Протестировать на production** ✅
2. **Настроить мониторинг** - следить за доступностью MinIO
3. **Настроить бэкапы** - регулярно бэкапить bucket
4. **Оптимизировать медиа** - сжать видео, конвертировать в WebP
5. **Добавить CDN** - поставить Cloudflare перед MinIO для ещё большей скорости

---

**Готово!** Ваше приложение теперь использует MinIO для медиа-файлов! 🎉
