#!/bin/bash
# Скрипт для проверки что мы на правильном stage сервере

echo "🔍 Проверка сервера..."

# Внутренний IP
INTERNAL_IP=$(hostname -I | awk '{print $1}')
echo "📍 Внутренний IP: $INTERNAL_IP"

# Внешний IP (через внешний сервис)
echo "🌐 Проверка внешнего IP..."
EXTERNAL_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipinfo.io/ip || echo "не определен")
echo "📍 Внешний IP: $EXTERNAL_IP"

# Проверяем hostname
HOSTNAME=$(hostname)
echo "📍 Hostname: $HOSTNAME"

# Проверяем что установлено
echo ""
echo "📦 Установленные компоненты:"

if command -v docker &> /dev/null; then
    echo "  ✅ Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
    echo "  ❌ Docker: не установлен"
fi

if docker compose version &> /dev/null 2>&1; then
    echo "  ✅ Docker Compose: установлен"
else
    echo "  ❌ Docker Compose: не установлен"
fi

if command -v nginx &> /dev/null; then
    echo "  ✅ Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
else
    echo "  ❌ Nginx: не установлен"
fi

if command -v certbot &> /dev/null; then
    echo "  ✅ Certbot: установлен"
else
    echo "  ❌ Certbot: не установлен"
fi

# Проверяем проект
echo ""
echo "📁 Проект:"
if [ -d "/var/www/app" ]; then
    echo "  ✅ Директория /var/www/app существует"
    if [ -f "/var/www/app/docker-compose.yml" ]; then
        echo "  ✅ docker-compose.yml найден"
        if [ -d "/var/www/app/.git" ]; then
            cd /var/www/app
            BRANCH=$(git branch --show-current 2>/dev/null || echo "не git")
            echo "  📍 Ветка: $BRANCH"
        fi
    fi
else
    echo "  ❌ Директория /var/www/app не найдена"
fi

echo ""
if [ "$EXTERNAL_IP" = "178.72.152.120" ]; then
    echo "✅ Это stage сервер (178.72.152.120)"
elif [ "$EXTERNAL_IP" != "не определен" ]; then
    echo "⚠️  Внешний IP: $EXTERNAL_IP (ожидался 178.72.152.120)"
else
    echo "⚠️  Не удалось определить внешний IP"
    echo "   Проверьте вручную или продолжайте настройку"
fi

