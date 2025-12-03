#!/bin/bash
# Скрипт для настройки stage сервера
# Использование: ./scripts/setup-stage-server.sh

set -e

STAGE_SERVER="178.72.152.120"
STAGE_USER="root"  # Измените если используется другой пользователь
PROJECT_DIR="/var/www/app"
DOMAIN="stage.nightfall-arena.ru"

echo "🚀 Настройка stage сервера $STAGE_SERVER..."

# Функция для выполнения команд на удаленном сервере
remote_exec() {
    ssh "$STAGE_USER@$STAGE_SERVER" "$1"
}

# Проверка и установка Docker
echo "🐳 Проверка Docker..."
if ! remote_exec "command -v docker &> /dev/null"; then
    echo "📦 Установка Docker..."
    remote_exec "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh"
else
    echo "✅ Docker уже установлен"
fi

# Проверка Docker Compose
echo "🐳 Проверка Docker Compose..."
if ! remote_exec "docker compose version &> /dev/null"; then
    echo "📦 Установка Docker Compose..."
    remote_exec "apt-get update && apt-get install -y docker-compose-plugin"
else
    echo "✅ Docker Compose уже установлен"
fi

# Проверка Nginx
echo "🌐 Проверка Nginx..."
if ! remote_exec "command -v nginx &> /dev/null"; then
    echo "📦 Установка Nginx..."
    remote_exec "apt-get update && apt-get install -y nginx"
else
    echo "✅ Nginx уже установлен"
fi

# Проверка Certbot
echo "🔒 Проверка Certbot..."
if ! remote_exec "command -v certbot &> /dev/null"; then
    echo "📦 Установка Certbot..."
    remote_exec "apt-get update && apt-get install -y certbot python3-certbot-nginx"
else
    echo "✅ Certbot уже установлен"
fi

# Создание директории для проекта
echo "📁 Создание директории проекта..."
remote_exec "mkdir -p $PROJECT_DIR"

# Проверка портов
echo "🔍 Проверка доступности портов..."
remote_exec "netstat -tuln | grep -E ':(80|443|3000|8080)' || echo 'Порты свободны'"

echo "✅ Stage сервер подготовлен!"
echo "📋 Следующий шаг: клонирование проекта"

