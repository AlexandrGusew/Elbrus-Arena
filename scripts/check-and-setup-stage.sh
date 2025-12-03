#!/bin/bash
# Скрипт для проверки и настройки stage сервера
# Выполните этот скрипт НА СТЕЙДЖ СЕРВЕРЕ

set -e

echo "🔍 Проверка текущего сервера..."

# Проверяем IP адрес
CURRENT_IP=$(hostname -I | awk '{print $1}')
echo "📍 Текущий IP: $CURRENT_IP"

# Проверяем hostname
HOSTNAME=$(hostname)
echo "📍 Hostname: $HOSTNAME"

# Проверяем наличие Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker установлен: $(docker --version)"
else
    echo "❌ Docker не установлен"
fi

# Проверяем наличие Docker Compose
if docker compose version &> /dev/null; then
    echo "✅ Docker Compose установлен: $(docker compose version)"
else
    echo "❌ Docker Compose не установлен"
fi

# Проверяем наличие Nginx
if command -v nginx &> /dev/null; then
    echo "✅ Nginx установлен: $(nginx -v 2>&1)"
else
    echo "❌ Nginx не установлен"
fi

# Проверяем наличие проекта
if [ -d "/var/www/app" ]; then
    echo "✅ Проект найден в /var/www/app"
    cd /var/www/app
    if [ -f "docker-compose.yml" ]; then
        echo "✅ docker-compose.yml найден"
        BRANCH=$(git branch --show-current 2>/dev/null || echo "не git репозиторий")
        echo "📍 Текущая ветка: $BRANCH"
    fi
else
    echo "❌ Проект не найден в /var/www/app"
fi

# Проверка DNS
echo ""
echo "🌐 Проверка DNS..."
DOMAIN="stage.nightfall-arena.ru"
EXPECTED_IP="178.72.152.120"

if command -v dig &> /dev/null; then
    DNS_IP=$(dig +short $DOMAIN 2>/dev/null | tail -n1)
    if [ -n "$DNS_IP" ]; then
        echo "📍 DNS запись: $DOMAIN -> $DNS_IP"
        if [ "$DNS_IP" = "$EXPECTED_IP" ]; then
            echo "✅ DNS настроен правильно"
        else
            echo "⚠️  DNS указывает на другой IP (ожидался $EXPECTED_IP)"
        fi
    else
        echo "❌ DNS запись не найдена или еще не распространилась"
    fi
else
    echo "⚠️  Утилита dig не установлена, проверьте DNS вручную"
fi

# Проверка SSL сертификата
echo ""
echo "🔒 Проверка SSL сертификата..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ SSL сертификат установлен"
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem 2>/dev/null | cut -d= -f2)
    echo "   Срок действия до: $CERT_EXPIRY"
else
    echo "❌ SSL сертификат не найден"
fi

# Проверка контейнеров
echo ""
echo "🐳 Проверка Docker контейнеров..."
if [ -d "/var/www/app" ]; then
    cd /var/www/app
    if [ -f "docker-compose.yml" ]; then
        if docker compose ps &> /dev/null; then
            echo "📊 Статус контейнеров:"
            docker compose ps
        else
            echo "⚠️  Контейнеры не запущены"
        fi
    fi
fi

echo ""
echo "📋 Следующие шаги:"
echo "1. Если DNS не настроен - добавьте A запись: stage -> $EXPECTED_IP"
echo "2. Если Docker/Nginx не установлены - выполните установку"
echo "3. Если проект не клонирован - клонируйте репозиторий"
echo "4. Настройте .env файлы"
echo "5. Настройте Nginx"
echo "6. Получите SSL сертификат (после настройки DNS)"
echo "7. Запустите приложение"
echo ""
echo "💡 После добавления DNS записи запустите:"
echo "   ./scripts/continue-after-dns.sh"

