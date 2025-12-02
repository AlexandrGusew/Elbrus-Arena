#!/bin/bash
# Упрощенная версия скрипта для выполнения НАПРЯМУЮ на stage сервере
# Использование: bash continue-after-dns-local.sh

set -e

DOMAIN="stage.nightfall-arena.ru"
EXPECTED_IP="178.72.152.120"
PROJECT_DIR="/var/www/app"

echo "🌐 Проверка DNS записи для $DOMAIN..."
DNS_IP=$(dig +short $DOMAIN 2>/dev/null | tail -n1 || echo "")
if [ -n "$DNS_IP" ] && [ "$DNS_IP" = "$EXPECTED_IP" ]; then
    echo "✅ DNS настроен правильно: $DOMAIN -> $DNS_IP"
else
    echo "⚠️  DNS: $DOMAIN -> ${DNS_IP:-не найден}"
    read -p "Продолжить? (y/n): " continue_dns
    [ "$continue_dns" != "y" ] && exit 1
fi

echo ""
echo "🚀 Продолжаем настройку stage сервера..."
echo ""

# Установка зависимостей
echo "📦 Проверка зависимостей..."
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh
else
    echo "✅ Docker установлен"
fi

if ! docker compose version &> /dev/null; then
    echo "📦 Установка Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin
else
    echo "✅ Docker Compose установлен"
fi

if ! command -v nginx &> /dev/null; then
    echo "📦 Установка Nginx..."
    apt-get update && apt-get install -y nginx
else
    echo "✅ Nginx установлен"
fi

if ! command -v certbot &> /dev/null; then
    echo "📦 Установка Certbot..."
    apt-get update && apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot установлен"
fi

# Клонирование проекта
echo ""
echo "📁 Проверка проекта..."
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "📥 Клонирование проекта..."
    mkdir -p $(dirname $PROJECT_DIR)
    cd $(dirname $PROJECT_DIR)
    git clone https://github.com/AlexandrGusew/Elbrus-Arena.git $(basename $PROJECT_DIR)
    cd $PROJECT_DIR
    git checkout dpl
else
    echo "✅ Проект найден, обновляем..."
    cd $PROJECT_DIR
    git fetch origin
    git checkout dpl
    git pull origin dpl
fi

# Проверка .env файлов
echo ""
echo "🔧 Проверка .env файлов..."
if [ ! -f "$PROJECT_DIR/.env" ] || [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    echo "⚠️  .env файлы не найдены"
    read -p "Создать базовые .env файлы? (y/n): " create_env
    if [ "$create_env" = "y" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        cat > $PROJECT_DIR/.env <<EOF
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"
PORT=3000
CORS_ORIGINS="https://nightfall-arena.ru,https://$DOMAIN"
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://$DOMAIN"
VITE_API_BASE_URL="/api"
VITE_WS_URL="wss://$DOMAIN"
VITE_MINIO_URL="https://nightfall-arena.ru/minio"
VITE_MINIO_BUCKET="elbrus-arena-assets"
VITE_USE_MINIO="true"
EOF
        cat > $PROJECT_DIR/backend/.env <<EOF
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"
PORT=3000
CORS_ORIGINS="https://nightfall-arena.ru,https://$DOMAIN"
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://$DOMAIN"
EOF
        echo "✅ .env файлы созданы"
        echo "⚠️  ВАЖНО: Проверьте JWT_SECRET и другие секретные значения!"
    fi
else
    echo "✅ .env файлы найдены"
fi

# Настройка Nginx
echo ""
echo "🌐 Настройка Nginx..."
if [ ! -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    echo "📝 Создание конфигурации Nginx..."
    cat > /etc/nginx/sites-available/$DOMAIN <<'NGINX_EOF'
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
    
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
    nginx -t && systemctl reload nginx
    echo "✅ Конфигурация Nginx создана и активирована"
else
    echo "✅ Конфигурация Nginx уже существует"
fi

# Получение SSL сертификата
echo ""
echo "🔒 Получение SSL сертификата..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "📜 Запрос SSL сертификата от Let's Encrypt..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@nightfall-arena.ru --redirect
    echo "✅ SSL сертификат получен"
else
    echo "✅ SSL сертификат уже существует"
fi

# Инициализация БД
echo ""
echo "🗄️  Инициализация базы данных..."
cd $PROJECT_DIR
docker compose run --rm backend npx prisma migrate deploy || echo "⚠️  Миграции могут быть уже применены"

# Сборка и запуск
echo ""
echo "🔨 Сборка Docker образов..."
docker compose build --no-cache

echo ""
echo "▶️  Запуск контейнеров..."
docker compose up -d

echo ""
echo "⏳ Ожидание запуска сервисов (30 секунд)..."
sleep 30

# Проверка статуса
echo ""
echo "✅ Проверка статуса..."
docker compose ps

echo ""
echo "✨ Настройка завершена!"
echo "🌐 Stage окружение должно быть доступно по адресу: https://$DOMAIN"
echo ""
echo "📋 Полезные команды:"
echo "   Просмотр логов: cd $PROJECT_DIR && docker compose logs -f"
echo "   Перезапуск: cd $PROJECT_DIR && docker compose restart"
echo "   Статус: cd $PROJECT_DIR && docker compose ps"


