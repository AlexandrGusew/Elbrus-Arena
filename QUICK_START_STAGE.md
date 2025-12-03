# Быстрый старт: Развертывание Stage окружения

## Шаг 1: Сбор конфигураций с продакшн (178.72.139.236)

### Если у вас есть SSH доступ:

```bash
ssh root@178.72.139.236

# Определите путь к проекту
cd /var/www/app  # или другой путь где находится проект

# Создайте архив с конфигурациями
mkdir -p /tmp/stage-configs
cp .env /tmp/stage-configs/.env.root 2>/dev/null || echo "Root .env не найден"
cp backend/.env /tmp/stage-configs/.env.backend 2>/dev/null || echo "Backend .env не найден"
cp docker-compose.yml /tmp/stage-configs/ 2>/dev/null || echo "docker-compose.yml не найден"
cp /etc/nginx/sites-available/nightfall-arena.ru /tmp/stage-configs/nginx-prod.conf 2>/dev/null || \
cp /etc/nginx/sites-available/default /tmp/stage-configs/nginx-prod.conf 2>/dev/null || \
echo "Nginx config не найден"

# Создайте архив
cd /tmp
tar -czf stage-configs.tar.gz stage-configs/
```

### Если SSH требует ключ (Permission denied):

**Вариант A:** Используйте веб-консоль провайдера для доступа к серверу

**Вариант B:** Выполните команды напрямую на продакшн сервере:

```bash
# На продакшн сервере (178.72.139.236) - через веб-консоль или другой доступ
cd /var/www/app  # или найдите проект: find / -name "docker-compose.yml" 2>/dev/null

# Создайте скрипт
cat > /tmp/get-configs.sh <<'EOF'
#!/bin/bash
mkdir -p /tmp/stage-configs
PROJECT_DIR="/var/www/app"
[ -d "$PROJECT_DIR" ] || PROJECT_DIR=$(find / -name "docker-compose.yml" -type f 2>/dev/null | head -1 | xargs dirname)
cd "$PROJECT_DIR"

[ -f ".env" ] && cp .env /tmp/stage-configs/.env.root && echo "✅ Root .env"
[ -f "backend/.env" ] && cp backend/.env /tmp/stage-configs/.env.backend && echo "✅ Backend .env"
[ -f "docker-compose.yml" ] && cp docker-compose.yml /tmp/stage-configs/ && echo "✅ docker-compose.yml"
[ -f "/etc/nginx/sites-available/nightfall-arena.ru" ] && \
    cp /etc/nginx/sites-available/nightfall-arena.ru /tmp/stage-configs/nginx.conf && echo "✅ nginx.conf"

cd /tmp && tar -czf stage-configs.tar.gz stage-configs/
echo "✅ Архив: /tmp/stage-configs.tar.gz"
EOF

chmod +x /tmp/get-configs.sh
/tmp/get-configs.sh

# Просмотрите содержимое
cat /tmp/stage-configs/.env.root
cat /tmp/stage-configs/.env.backend
```

**Вариант C:** Настройте SSH ключ (см. `SSH_ACCESS_GUIDE.md`)

### Копирование конфигураций:

Если у вас есть доступ к серверу через другой способ, просто скопируйте значения из файлов:
- `.env` (root)
- `backend/.env`  
- `/etc/nginx/sites-available/nightfall-arena.ru`

Эти значения понадобятся для настройки stage сервера.

## Шаг 2: Настройка Stage сервера (178.72.152.120)

### 2.1 Проверка текущего состояния

Если вы уже на stage сервере (видите `root@stage`), проверьте что уже установлено:

```bash
# Проверка внешнего IP адреса (должен быть 178.72.152.120)
curl -s ifconfig.me
# или
curl -s icanhazip.com

# Проверка установленных компонентов
docker --version 2>/dev/null || echo "Docker не установлен"
docker compose version 2>/dev/null || echo "Docker Compose не установлен"
nginx -v 2>/dev/null || echo "Nginx не установлен"
certbot --version 2>/dev/null || echo "Certbot не установлен"

# Проверка проекта
ls -la /var/www/app 2>/dev/null || echo "Проект не найден"
```

### 2.2 Установка зависимостей (если не установлены)

```bash
# Обновление системы
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

# Проверка
docker --version
docker compose version
nginx -v
```

### 2.2 Клонирование проекта

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/AlexandrGusew/Elbrus-Arena.git app
cd app
git checkout dpl
```

### 2.3 Настройка переменных окружения

Создайте `.env` файлы на основе продакшн конфигураций:

```bash
# Root .env
cat > .env <<'EOF'
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"
PORT=3000
CORS_ORIGINS="https://nightfall-arena.ru,https://stage.nightfall-arena.ru"
JWT_SECRET="СКОПИРУЙТЕ_ИЗ_ПРОДАКШН"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://stage.nightfall-arena.ru"
VITE_API_BASE_URL="/api"
VITE_WS_URL="wss://stage.nightfall-arena.ru"
VITE_MINIO_URL="https://nightfall-arena.ru/minio"
VITE_MINIO_BUCKET="elbrus-arena-assets"
VITE_USE_MINIO="true"
EOF

# Backend .env
cat > backend/.env <<'EOF'
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"
PORT=3000
CORS_ORIGINS="https://nightfall-arena.ru,https://stage.nightfall-arena.ru"
JWT_SECRET="СКОПИРУЙТЕ_ИЗ_ПРОДАКШН"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://stage.nightfall-arena.ru"
TELEGRAM_BOT_TOKEN="СКОПИРУЙТЕ_ИЗ_ПРОДАКШН_ИЛИ_ОСТАВЬТЕ_ПУСТЫМ"
EOF
```

**Важно:** Замените `СКОПИРУЙТЕ_ИЗ_ПРОДАКШН` на реальные значения из продакшн `.env` файлов!

### 2.4 Настройка Nginx

```bash
cat > /etc/nginx/sites-available/stage.nightfall-arena.ru <<'NGINX_EOF'
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
NGINX_EOF

# Активируйте конфигурацию
ln -sf /etc/nginx/sites-available/stage.nightfall-arena.ru /etc/nginx/sites-enabled/

# Проверьте конфигурацию
nginx -t

# Перезагрузите nginx
systemctl reload nginx
```

## Шаг 3: Настройка DNS

**ВАЖНО:** Сделайте это ПЕРЕД получением SSL!

Добавьте A запись в DNS провайдере:
- **Имя:** `stage`
- **Тип:** `A`
- **Значение:** `178.72.152.120`
- **TTL:** `3600`

Подождите 5-15 минут и проверьте:

```bash
dig stage.nightfall-arena.ru +short
# Должен вернуть: 178.72.152.120
```

## Шаг 4: Получение SSL сертификата

```bash
# На stage сервере
certbot --nginx -d stage.nightfall-arena.ru --non-interactive --agree-tos --email admin@nightfall-arena.ru

# Проверьте сертификат
certbot certificates
```

## Шаг 5: Инициализация БД и запуск

```bash
cd /var/www/app

# Миграции БД
docker compose run --rm backend npx prisma migrate deploy

# Сборка образов
docker compose build --no-cache

# Запуск контейнеров
docker compose up -d

# Проверка статуса
docker compose ps

# Просмотр логов
docker compose logs -f
```

## Шаг 6: Проверка

1. Откройте в браузере: `https://stage.nightfall-arena.ru`
2. Проверьте API: `curl https://stage.nightfall-arena.ru/api`
3. Проверьте логи: `docker compose logs -f`

## Готово!

Stage окружение должно быть доступно по адресу: **https://stage.nightfall-arena.ru**

---

**Примечания:**
- Используется та же БД что на продакшн
- Используется то же MinIO хранилище
- Все медиа файлы общие между продакшн и stage

