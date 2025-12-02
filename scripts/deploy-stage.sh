#!/bin/bash
# Полный скрипт развертывания stage окружения
# Использование: ./scripts/deploy-stage.sh

set -e

STAGE_SERVER="178.72.152.120"
STAGE_USER="root"
PROJECT_DIR="/var/www/app"
DOMAIN="stage.nightfall-arena.ru"
REPO_URL="https://github.com/AlexandrGusew/Elbrus-Arena.git"
BRANCH="dpl"

echo "🚀 Развертывание stage окружения на $STAGE_SERVER"
echo "🌐 Домен: $DOMAIN"
echo ""

# Функция для выполнения команд на удаленном сервере
remote_exec() {
    ssh "$STAGE_USER@$STAGE_SERVER" "$1"
}

# Шаг 1: Клонирование проекта
echo "📥 Клонирование проекта..."
if remote_exec "[ -d $PROJECT_DIR/.git ]"; then
    echo "⚠️  Проект уже существует, обновляем..."
    remote_exec "cd $PROJECT_DIR && git fetch origin && git checkout $BRANCH && git pull origin $BRANCH"
else
    remote_exec "cd $(dirname $PROJECT_DIR) && git clone $REPO_URL $(basename $PROJECT_DIR) && cd $PROJECT_DIR && git checkout $BRANCH"
fi

# Шаг 2: Копирование конфигураций (если есть локальная директория prod-configs)
echo "📋 Настройка конфигураций..."
if [ -d "./prod-configs" ]; then
    echo "📤 Копирование .env файлов..."
    if [ -f "./prod-configs/.env.backend" ]; then
        scp "./prod-configs/.env.backend" "$STAGE_USER@$STAGE_SERVER:$PROJECT_DIR/backend/.env"
    fi
    if [ -f "./prod-configs/.env.root" ]; then
        scp "./prod-configs/.env.root" "$STAGE_USER@$STAGE_SERVER:$PROJECT_DIR/.env"
    fi
else
    echo "⚠️  Директория prod-configs не найдена. Создайте .env файлы вручную."
fi

# Шаг 3: Адаптация .env для stage
echo "🔧 Адаптация переменных окружения для stage..."
remote_exec "cd $PROJECT_DIR && \
    sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g' .env backend/.env 2>/dev/null || true && \
    sed -i 's|CORS_ORIGINS=.*|CORS_ORIGINS=https://nightfall-arena.ru,https://$DOMAIN|g' .env backend/.env 2>/dev/null || true"

# Шаг 4: Создание nginx конфигурации
echo "🌐 Настройка Nginx..."
cat > /tmp/nginx-stage.conf <<EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    # SSL certificates (will be set by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

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

    # MinIO proxy для статических медиа (используем продакшн MinIO)
    location /minio/ {
        proxy_pass http://nightfall-arena.ru/minio/;
        proxy_set_header Host nightfall-arena.ru;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # CORS headers для медиа-файлов
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Range, Content-Type' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;

        # Обработка preflight запросов
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Range, Content-Type';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Кеширование медиа-файлов
        expires 30d;
        add_header Cache-Control "public, immutable";

        # Поддержка range requests для видео
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Таймауты для API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket для real-time communication
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket таймауты
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Frontend SPA
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Поддержка SPA routing
        proxy_intercept_errors on;
        error_page 404 = @frontend;
    }

    # Fallback для SPA (возвращаем index.html для всех 404)
    location @frontend {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Логирование
    access_log /var/log/nginx/stage-nightfall-arena-access.log;
    error_log /var/log/nginx/stage-nightfall-arena-error.log;
}
EOF

scp /tmp/nginx-stage.conf "$STAGE_USER@$STAGE_SERVER:/etc/nginx/sites-available/$DOMAIN"
remote_exec "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN && nginx -t"

# Шаг 5: Получение SSL сертификата
echo "🔒 Получение SSL сертификата..."
remote_exec "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@nightfall-arena.ru || echo 'Certbot требует ручного запуска после настройки DNS'"

# Шаг 6: Инициализация базы данных
echo "🗄️  Инициализация базы данных..."
remote_exec "cd $PROJECT_DIR && docker compose run --rm backend npx prisma migrate deploy"

# Шаг 7: Сборка и запуск
echo "🔨 Сборка Docker образов..."
remote_exec "cd $PROJECT_DIR && docker compose build --no-cache"

echo "▶️  Запуск контейнеров..."
remote_exec "cd $PROJECT_DIR && docker compose up -d"

echo "⏳ Ожидание запуска сервисов..."
sleep 15

# Шаг 8: Проверка статуса
echo "✅ Проверка статуса..."
remote_exec "cd $PROJECT_DIR && docker compose ps"

echo ""
echo "✨ Развертывание завершено!"
echo "🌐 Stage окружение доступно по адресу: https://$DOMAIN"
echo ""
echo "📋 Полезные команды:"
echo "   Просмотр логов: ssh $STAGE_USER@$STAGE_SERVER 'cd $PROJECT_DIR && docker compose logs -f'"
echo "   Перезапуск: ssh $STAGE_USER@$STAGE_SERVER 'cd $PROJECT_DIR && docker compose restart'"
echo "   Статус: ssh $STAGE_USER@$STAGE_SERVER 'cd $PROJECT_DIR && docker compose ps'"

