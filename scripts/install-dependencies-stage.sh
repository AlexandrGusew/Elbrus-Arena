#!/bin/bash
# Скрипт для установки всех зависимостей на stage сервере
# Выполните: bash <(cat scripts/install-dependencies-stage.sh) или скопируйте команды

set -e

echo "🚀 Установка зависимостей для stage сервера..."
echo ""

# Обновление системы
echo "📦 Обновление списка пакетов..."
apt update && apt upgrade -y

# Установка Docker
echo ""
echo "🐳 Установка Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker уже установлен: $(docker --version)"
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker установлен: $(docker --version)"
fi

# Установка Docker Compose
echo ""
echo "🐳 Установка Docker Compose..."
if docker compose version &> /dev/null 2>&1; then
    echo "✅ Docker Compose уже установлен"
else
    apt install docker-compose-plugin -y
    echo "✅ Docker Compose установлен: $(docker compose version)"
fi

# Установка Nginx
echo ""
echo "🌐 Установка Nginx..."
if command -v nginx &> /dev/null; then
    echo "✅ Nginx уже установлен: $(nginx -v 2>&1)"
else
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
    echo "✅ Nginx установлен и запущен"
fi

# Установка Certbot
echo ""
echo "🔒 Установка Certbot..."
if command -v certbot &> /dev/null; then
    echo "✅ Certbot уже установлен"
else
    apt install certbot python3-certbot-nginx -y
    echo "✅ Certbot установлен"
fi

# Проверка установки
echo ""
echo "✅ Проверка установленных компонентов:"
echo "   Docker: $(docker --version)"
echo "   Docker Compose: $(docker compose version)"
echo "   Nginx: $(nginx -v 2>&1 | head -1)"
echo "   Certbot: $(certbot --version 2>&1 | head -1)"

echo ""
echo "✨ Все зависимости установлены!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Клонировать проект: git clone https://github.com/AlexandrGusew/Elbrus-Arena.git /var/www/app"
echo "2. Перейти в проект: cd /var/www/app && git checkout dpl"
echo "3. Настроить .env файлы"
echo "4. Настроить Nginx"
echo "5. Получить SSL сертификат"
echo "6. Запустить приложение"

