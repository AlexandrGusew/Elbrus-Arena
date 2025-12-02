#!/bin/bash
# Скрипт для продолжения настройки stage после добавления DNS A записи
# Использование: ./scripts/continue-after-dns.sh
# Или на stage сервере: bash continue-after-dns.sh

set -e

DOMAIN="stage.nightfall-arena.ru"
EXPECTED_IP="178.72.152.120"
PROJECT_DIR="/var/www/app"

echo "🌐 Проверка DNS записи для $DOMAIN..."
echo ""

# Функция проверки DNS
check_dns() {
    echo "🔍 Проверяем DNS запись..."
    
    # Пробуем разные способы проверки DNS
    DNS_IP=""
    
    if command -v dig &> /dev/null; then
        DNS_IP=$(dig +short $DOMAIN | tail -n1)
    elif command -v nslookup &> /dev/null; then
        DNS_IP=$(nslookup $DOMAIN 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -n1)
    elif command -v host &> /dev/null; then
        DNS_IP=$(host $DOMAIN | grep "has address" | awk '{print $4}' | head -n1)
    else
        echo "⚠️  Не найдены утилиты для проверки DNS (dig/nslookup/host)"
        echo "   Проверьте DNS вручную: https://www.whatsmydns.net/#A/$DOMAIN"
        read -p "DNS запись настроена? (y/n): " dns_ready
        if [ "$dns_ready" != "y" ]; then
            echo "❌ Настройте DNS запись и запустите скрипт снова"
            exit 1
        fi
        DNS_IP="$EXPECTED_IP"
    fi
    
    if [ -z "$DNS_IP" ]; then
        echo "❌ Не удалось получить IP адрес для $DOMAIN"
        echo "   Проверьте DNS запись: https://www.whatsmydns.net/#A/$DOMAIN"
        echo ""
        echo "📋 Убедитесь что добавлена A запись:"
        echo "   Имя: stage"
        echo "   Тип: A"
        echo "   Значение: $EXPECTED_IP"
        echo "   TTL: 3600"
        echo ""
        read -p "DNS запись настроена? (y/n): " dns_ready
        if [ "$dns_ready" != "y" ]; then
            echo "❌ Настройте DNS запись и запустите скрипт снова"
            exit 1
        fi
    else
        echo "📍 DNS возвращает IP: $DNS_IP"
        if [ "$DNS_IP" = "$EXPECTED_IP" ]; then
            echo "✅ DNS запись настроена правильно!"
        else
            echo "⚠️  DNS возвращает другой IP ($DNS_IP вместо $EXPECTED_IP)"
            echo "   Это может быть нормально, если используется CDN или прокси"
            read -p "Продолжить? (y/n): " continue_anyway
            if [ "$continue_anyway" != "y" ]; then
                exit 1
            fi
        fi
    fi
    
    echo ""
    echo "⏳ Ждем 10 секунд для распространения DNS..."
    sleep 10
}

# Проверка что мы на stage сервере или можем подключиться
check_server() {
    CURRENT_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
    EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "")
    
    if [ "$CURRENT_IP" = "$EXPECTED_IP" ] || [ "$EXTERNAL_IP" = "$EXPECTED_IP" ]; then
        echo "✅ Мы на stage сервере ($EXPECTED_IP)"
        return 0
    else
        echo "⚠️  Похоже мы не на stage сервере"
        echo "   Текущий IP: $CURRENT_IP / $EXTERNAL_IP"
        echo "   Ожидаемый: $EXPECTED_IP"
        read -p "Продолжить настройку? (y/n): " continue_local
        if [ "$continue_local" != "y" ]; then
            echo "💡 Подключитесь к stage серверу: ssh root@$EXPECTED_IP"
            exit 1
        fi
        return 1
    fi
}

# Функция для выполнения команд (локально или удаленно)
remote_exec() {
    if [ "$IS_REMOTE" = "true" ]; then
        ssh "$STAGE_USER@$STAGE_SERVER" "$1"
    else
        eval "$1"
    fi
}

# Определяем режим работы
IS_REMOTE="false"
STAGE_SERVER="178.72.152.120"
STAGE_USER="root"

if ! check_server; then
    echo ""
    read -p "Подключиться к удаленному серверу $STAGE_SERVER? (y/n): " connect_remote
    if [ "$connect_remote" = "y" ]; then
        IS_REMOTE="true"
        echo "🔌 Подключение к $STAGE_SERVER..."
    fi
fi

# Проверка DNS
check_dns

echo ""
echo "🚀 Продолжаем настройку stage сервера..."
echo ""

# Шаг 1: Проверка и установка зависимостей
echo "📦 Проверка зависимостей..."
if ! remote_exec "command -v docker &> /dev/null"; then
    echo "📦 Установка Docker..."
    remote_exec "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh"
else
    echo "✅ Docker установлен"
fi

if ! remote_exec "docker compose version &> /dev/null"; then
    echo "📦 Установка Docker Compose..."
    remote_exec "apt-get update && apt-get install -y docker-compose-plugin"
else
    echo "✅ Docker Compose установлен"
fi

if ! remote_exec "command -v nginx &> /dev/null"; then
    echo "📦 Установка Nginx..."
    remote_exec "apt-get update && apt-get install -y nginx"
else
    echo "✅ Nginx установлен"
fi

if ! remote_exec "command -v certbot &> /dev/null"; then
    echo "📦 Установка Certbot..."
    remote_exec "apt-get update && apt-get install -y certbot python3-certbot-nginx"
else
    echo "✅ Certbot установлен"
fi

# Шаг 2: Проверка проекта
echo ""
echo "📁 Проверка проекта..."
if ! remote_exec "[ -d $PROJECT_DIR/.git ]"; then
    echo "❌ Проект не найден в $PROJECT_DIR"
    echo "📥 Клонирование проекта..."
    remote_exec "mkdir -p $(dirname $PROJECT_DIR) && cd $(dirname $PROJECT_DIR) && git clone https://github.com/AlexandrGusew/Elbrus-Arena.git $(basename $PROJECT_DIR) && cd $PROJECT_DIR && git checkout dpl"
else
    echo "✅ Проект найден"
    remote_exec "cd $PROJECT_DIR && git fetch origin && git checkout dpl && git pull origin dpl"
fi

# Шаг 3: Проверка .env файлов
echo ""
echo "🔧 Проверка .env файлов..."
if ! remote_exec "[ -f $PROJECT_DIR/.env ]" || ! remote_exec "[ -f $PROJECT_DIR/backend/.env ]"; then
    echo "⚠️  .env файлы не найдены или неполные"
    echo "📋 Создайте .env файлы на основе продакшн конфигураций"
    echo ""
    echo "💡 Используйте скрипт fix-stage-env.sh для создания базовых .env файлов"
    read -p "Создать базовые .env файлы? (y/n): " create_env
    if [ "$create_env" = "y" ]; then
        remote_exec "cd $PROJECT_DIR && bash -c 'cat > .env <<ENV_EOF
DATABASE_URL=\"postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable\"
PORT=3000
CORS_ORIGINS=\"https://nightfall-arena.ru,https://$DOMAIN\"
JWT_SECRET=\"$(openssl rand -base64 32)\"
JWT_EXPIRES_IN=\"7d\"
FRONTEND_URL=\"https://$DOMAIN\"
VITE_API_BASE_URL=\"/api\"
VITE_WS_URL=\"wss://$DOMAIN\"
VITE_MINIO_URL=\"https://nightfall-arena.ru/minio\"
VITE_MINIO_BUCKET=\"elbrus-arena-assets\"
VITE_USE_MINIO=\"true\"
ENV_EOF
'"
        remote_exec "cd $PROJECT_DIR && bash -c 'cat > backend/.env <<ENV_EOF
DATABASE_URL=\"postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable\"
PORT=3000
CORS_ORIGINS=\"https://nightfall-arena.ru,https://$DOMAIN\"
JWT_SECRET=\"$(grep JWT_SECRET $PROJECT_DIR/.env | cut -d= -f2 | tr -d \\\")\"
JWT_EXPIRES_IN=\"7d\"
FRONTEND_URL=\"https://$DOMAIN\"
ENV_EOF
'"
        echo "✅ Базовые .env файлы созданы"
        echo "⚠️  ВАЖНО: Проверьте JWT_SECRET и другие секретные значения!"
    fi
else
    echo "✅ .env файлы найдены"
fi

# Шаг 4: Настройка Nginx
echo ""
echo "🌐 Настройка Nginx..."
if ! remote_exec "[ -f /etc/nginx/sites-available/$DOMAIN ]"; then
    echo "📝 Создание конфигурации Nginx..."
    
    # Создаем конфигурацию nginx
    remote_exec "cat > /tmp/nginx-stage.conf <<'NGINX_EOF'
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

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
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # MinIO proxy (используем продакшн MinIO)
    location /minio/ {
        proxy_pass http://nightfall-arena.ru/minio/;
        proxy_set_header Host nightfall-arena.ru;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Range, Content-Type' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;

        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Range, Content-Type';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        expires 30d;
        add_header Cache-Control \"public, immutable\";
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

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

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

        proxy_intercept_errors on;
        error_page 404 = @frontend;
    }

    location @frontend {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    access_log /var/log/nginx/stage-nightfall-arena-access.log;
    error_log /var/log/nginx/stage-nightfall-arena-error.log;
}
NGINX_EOF
"
    
    if [ "$IS_REMOTE" = "true" ]; then
        scp /tmp/nginx-stage.conf "$STAGE_USER@$STAGE_SERVER:/etc/nginx/sites-available/$DOMAIN"
    else
        cp /tmp/nginx-stage.conf "/etc/nginx/sites-available/$DOMAIN"
    fi
    
    remote_exec "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN"
    remote_exec "nginx -t && systemctl reload nginx"
    echo "✅ Конфигурация Nginx создана и активирована"
else
    echo "✅ Конфигурация Nginx уже существует"
fi

# Шаг 5: Получение SSL сертификата
echo ""
echo "🔒 Получение SSL сертификата..."
if ! remote_exec "[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]"; then
    echo "📜 Запрос SSL сертификата от Let's Encrypt..."
    remote_exec "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@nightfall-arena.ru --redirect"
    echo "✅ SSL сертификат получен"
else
    echo "✅ SSL сертификат уже существует"
    remote_exec "certbot renew --dry-run" || echo "⚠️  Проверка обновления сертификата не удалась"
fi

# Шаг 6: Инициализация базы данных
echo ""
echo "🗄️  Инициализация базы данных..."
remote_exec "cd $PROJECT_DIR && docker compose run --rm backend npx prisma migrate deploy" || echo "⚠️  Миграции могут быть уже применены"

# Шаг 7: Сборка и запуск
echo ""
echo "🔨 Сборка Docker образов..."
remote_exec "cd $PROJECT_DIR && docker compose build --no-cache"

echo ""
echo "▶️  Запуск контейнеров..."
remote_exec "cd $PROJECT_DIR && docker compose up -d"

echo ""
echo "⏳ Ожидание запуска сервисов (30 секунд)..."
sleep 30

# Шаг 8: Проверка статуса
echo ""
echo "✅ Проверка статуса..."
remote_exec "cd $PROJECT_DIR && docker compose ps"

echo ""
echo "✨ Настройка завершена!"
echo "🌐 Stage окружение должно быть доступно по адресу: https://$DOMAIN"
echo ""
echo "📋 Полезные команды:"
if [ "$IS_REMOTE" = "true" ]; then
    echo "   Просмотр логов: ssh $STAGE_USER@$STAGE_SERVER 'cd $PROJECT_DIR && docker compose logs -f'"
    echo "   Перезапуск: ssh $STAGE_USER@$STAGE_SERVER 'cd $PROJECT_DIR && docker compose restart'"
    echo "   Статус: ssh $STAGE_USER@$STAGE_SERVER 'cd $PROJECT_DIR && docker compose ps'"
else
    echo "   Просмотр логов: cd $PROJECT_DIR && docker compose logs -f"
    echo "   Перезапуск: cd $PROJECT_DIR && docker compose restart"
    echo "   Статус: cd $PROJECT_DIR && docker compose ps"
fi


