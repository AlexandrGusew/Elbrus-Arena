# Инструкция по развертыванию Stage окружения

## Обзор

Создание полной копии структуры продакшн сервера (178.72.139.236) на новом stage сервере (178.72.152.120) с поддоменом `stage.nightfall-arena.ru`.

**Важно:**
- Используется та же база данных что на продакшн
- Используется то же MinIO хранилище что на продакшн
- SSL сертификат настраивается через Let's Encrypt

## Предварительные требования

1. SSH доступ к обоим серверам:
   - Продакшн: `178.72.139.236`
   - Stage: `178.72.152.120`
2. DNS доступ для настройки A записи для `stage.nightfall-arena.ru`
3. Права root или sudo на обоих серверах

## Шаг 1: Сбор конфигураций с продакшн сервера

### Вариант A: Автоматический сбор (если есть SSH доступ)

```bash
# Сделайте скрипт исполняемым
chmod +x scripts/collect-prod-configs.sh

# Запустите сбор конфигураций
./scripts/collect-prod-configs.sh
```

Конфигурации будут сохранены в `./prod-configs/`

### Вариант B: Ручной сбор

Подключитесь к продакшн серверу:

```bash
ssh root@178.72.139.236
```

Соберите следующие файлы:

```bash
# Определите путь к проекту (обычно /var/www/app)
cd /var/www/app  # или другой путь

# Скопируйте .env файлы
cat .env > /tmp/prod-env-root.txt
cat backend/.env > /tmp/prod-env-backend.txt

# Скопируйте docker-compose.yml
cat docker-compose.yml > /tmp/prod-docker-compose.yml

# Скопируйте nginx конфигурацию
cat /etc/nginx/sites-available/nightfall-arena.ru > /tmp/prod-nginx.conf

# Выйдите с сервера
exit
```

Затем скопируйте файлы на локальную машину:

```bash
scp root@178.72.139.236:/tmp/prod-*.txt ./prod-configs/
scp root@178.72.139.236:/tmp/prod-*.yml ./prod-configs/
scp root@178.72.139.236:/tmp/prod-*.conf ./prod-configs/
```

## Шаг 2: Настройка Stage сервера

### Автоматическая настройка

```bash
chmod +x scripts/setup-stage-server.sh
./scripts/setup-stage-server.sh
```

### Ручная настройка

Подключитесь к stage серверу:

```bash
ssh root@178.72.152.120
```

Установите зависимости:

```bash
# Обновление пакетов
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Установка Docker Compose
apt install docker-compose-plugin -y

# Установка Nginx
apt install nginx -y

# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Проверка установки
docker --version
docker compose version
nginx -v
certbot --version
```

## Шаг 3: Настройка DNS

**ВАЖНО:** Сделайте это перед получением SSL сертификата!

Добавьте A запись в DNS:
- Имя: `stage`
- Тип: `A`
- Значение: `178.72.152.120`
- TTL: `3600` (или по умолчанию)

Подождите 5-15 минут для распространения DNS.

Проверьте:

```bash
dig stage.nightfall-arena.ru +short
# Должен вернуть: 178.72.152.120
```

## Шаг 4: Развертывание приложения

### Автоматическое развертывание

```bash
chmod +x scripts/deploy-stage.sh
./scripts/deploy-stage.sh
```

### Ручное развертывание

#### 4.1 Клонирование проекта

```bash
ssh root@178.72.152.120

# Создайте директорию
mkdir -p /var/www
cd /var/www

# Клонируйте проект
git clone https://github.com/AlexandrGusew/Elbrus-Arena.git app
cd app
git checkout dpl
```

#### 4.2 Настройка переменных окружения

Создайте `.env` файлы на основе продакшн конфигураций:

```bash
# Root .env
cat > .env <<EOF
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"
PORT=3000
CORS_ORIGINS="https://nightfall-arena.ru,https://stage.nightfall-arena.ru"
JWT_SECRET="ваш_секретный_ключ_из_продакшн"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://stage.nightfall-arena.ru"
VITE_API_BASE_URL="/api"
VITE_WS_URL="wss://stage.nightfall-arena.ru"
VITE_MINIO_URL="https://nightfall-arena.ru/minio"
VITE_MINIO_BUCKET="elbrus-arena-assets"
VITE_USE_MINIO="true"
EOF

# Backend .env
cat > backend/.env <<EOF
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"
PORT=3000
CORS_ORIGINS="https://nightfall-arena.ru,https://stage.nightfall-arena.ru"
JWT_SECRET="ваш_секретный_ключ_из_продакшн"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://stage.nightfall-arena.ru"
TELEGRAM_BOT_TOKEN="ваш_токен_или_оставьте_пустым"
EOF
```

#### 4.3 Настройка Nginx

Создайте конфигурацию nginx:

```bash
cat > /etc/nginx/sites-available/stage.nightfall-arena.ru <<'EOF'
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name stage.nightfall-arena.ru;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stage.nightfall-arena.ru;

    # SSL certificates (will be set by certbot)
    ssl_certificate /etc/letsencrypt/live/stage.nightfall-arena.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stage.nightfall-arena.ru/privkey.pem;

    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # MinIO proxy (используем продакшн MinIO)
    location /minio/ {
        proxy_pass http://nightfall-arena.ru/minio/;
        proxy_set_header Host nightfall-arena.ru;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Range, Content-Type' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Range, Content-Type';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        expires 30d;
        add_header Cache-Control "public, immutable";
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Frontend SPA
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_intercept_errors on;
        error_page 404 = @frontend;
    }

    location @frontend {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/stage-nightfall-arena-access.log;
    error_log /var/log/nginx/stage-nightfall-arena-error.log;
}
EOF

# Активируйте конфигурацию
ln -sf /etc/nginx/sites-available/stage.nightfall-arena.ru /etc/nginx/sites-enabled/

# Проверьте конфигурацию
nginx -t

# Перезагрузите nginx
systemctl reload nginx
```

#### 4.4 Получение SSL сертификата

```bash
# Убедитесь что DNS настроен и доступен
certbot --nginx -d stage.nightfall-arena.ru --non-interactive --agree-tos --email admin@nightfall-arena.ru

# Проверьте что сертификат установлен
certbot certificates
```

#### 4.5 Инициализация базы данных

```bash
cd /var/www/app

# Запустите миграции
docker compose run --rm backend npx prisma migrate deploy
```

#### 4.6 Сборка и запуск

```bash
# Сборка образов
docker compose build --no-cache

# Запуск контейнеров
docker compose up -d

# Проверка статуса
docker compose ps

# Просмотр логов
docker compose logs -f
```

## Шаг 5: Проверка

1. **Проверка HTTPS:**
   ```bash
   curl -I https://stage.nightfall-arena.ru
   ```

2. **Проверка API:**
   ```bash
   curl https://stage.nightfall-arena.ru/api
   ```

3. **Проверка в браузере:**
   - Откройте https://stage.nightfall-arena.ru
   - Проверьте что все работает

4. **Проверка логов:**
   ```bash
   ssh root@178.72.152.120
   cd /var/www/app
   docker compose logs -f
   ```

## Полезные команды

```bash
# Просмотр логов
ssh root@178.72.152.120 'cd /var/www/app && docker compose logs -f'

# Перезапуск контейнеров
ssh root@178.72.152.120 'cd /var/www/app && docker compose restart'

# Обновление кода
ssh root@178.72.152.120 'cd /var/www/app && git pull origin dpl && docker compose build && docker compose up -d'

# Проверка статуса
ssh root@178.72.152.120 'cd /var/www/app && docker compose ps'

# Просмотр nginx логов
ssh root@178.72.152.120 'tail -f /var/log/nginx/stage-nightfall-arena-*.log'
```

## Устранение проблем

### Проблема: SSL сертификат не получается

- Убедитесь что DNS настроен: `dig stage.nightfall-arena.ru`
- Убедитесь что порт 80 открыт: `netstat -tuln | grep :80`
- Попробуйте получить сертификат вручную: `certbot certonly --standalone -d stage.nightfall-arena.ru`

### Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker compose logs backend
docker compose logs frontend

# Проверьте .env файлы
cat .env
cat backend/.env
```

### Проблема: MinIO медиа не загружаются

- Проверьте что продакшн MinIO доступен
- Проверьте nginx конфигурацию для `/minio/`
- Проверьте CORS настройки

## Важные замечания

⚠️ **База данных:** Stage использует ту же БД что и продакшн. Будьте осторожны с тестовыми данными!

⚠️ **MinIO:** Stage использует то же хранилище что и продакшн. Медиа файлы общие.

⚠️ **JWT_SECRET:** Можно использовать тот же или создать отдельный для stage.

---

**Готово!** Stage окружение должно быть доступно по адресу https://stage.nightfall-arena.ru

