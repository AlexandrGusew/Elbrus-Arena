#!/bin/bash
# Скрипт для сбора конфигураций напрямую на продакшн сервере
# Использование: Выполните этот скрипт НА ПРОДАКШН СЕРВЕРЕ (178.72.139.236)

set -e

PROJECT_DIR="/var/www/app"  # Измените если проект в другом месте
OUTPUT_DIR="/tmp/stage-configs"

echo "📥 Сбор конфигураций для stage окружения..."
echo "📁 Проект: $PROJECT_DIR"

# Создаем директорию
mkdir -p "$OUTPUT_DIR"

# Проверяем существование проекта
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Проект не найден в $PROJECT_DIR"
    echo "🔍 Ищем проект..."
    
    # Попробуем найти проект
    POSSIBLE_PATHS=(
        "/var/www/app"
        "/root/app"
        "/home/app"
        "/opt/app"
    )
    
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -d "$path" ] && [ -f "$path/docker-compose.yml" ]; then
            PROJECT_DIR="$path"
            echo "✅ Найден проект в: $PROJECT_DIR"
            break
        fi
    done
    
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "❌ Проект не найден. Укажите путь вручную:"
        read -p "Путь к проекту: " PROJECT_DIR
    fi
fi

cd "$PROJECT_DIR"

# Собираем конфигурации
echo "📋 Копирование .env файлов..."
[ -f ".env" ] && cp .env "$OUTPUT_DIR/.env.root" && echo "✅ Root .env скопирован" || echo "⚠️  Root .env не найден"
[ -f "backend/.env" ] && cp backend/.env "$OUTPUT_DIR/.env.backend" && echo "✅ Backend .env скопирован" || echo "⚠️  Backend .env не найден"

echo "📋 Копирование docker-compose.yml..."
[ -f "docker-compose.yml" ] && cp docker-compose.yml "$OUTPUT_DIR/" && echo "✅ docker-compose.yml скопирован" || echo "⚠️  docker-compose.yml не найден"

echo "📋 Копирование nginx конфигурации..."
# Ищем nginx конфигурацию
if [ -f "/etc/nginx/sites-available/nightfall-arena.ru" ]; then
    cp /etc/nginx/sites-available/nightfall-arena.ru "$OUTPUT_DIR/nginx-nightfall-arena.ru.conf"
    echo "✅ Nginx конфигурация скопирована"
elif [ -f "/etc/nginx/sites-available/default" ]; then
    cp /etc/nginx/sites-available/default "$OUTPUT_DIR/nginx-default.conf"
    echo "✅ Nginx default конфигурация скопирована"
else
    echo "⚠️  Nginx конфигурация не найдена"
fi

# Создаем файл с информацией о структуре
echo "📋 Сохранение информации о проекте..."
{
    echo "=== Информация о проекте ==="
    echo "Путь: $PROJECT_DIR"
    echo "Дата: $(date)"
    echo ""
    echo "=== Структура проекта ==="
    ls -la
    echo ""
    echo "=== Docker контейнеры ==="
    docker compose ps 2>/dev/null || echo "Docker compose не доступен"
    echo ""
    echo "=== Переменные окружения (без секретов) ==="
    [ -f ".env" ] && grep -E "^(DATABASE_URL|PORT|FRONTEND_URL|CORS_ORIGINS|VITE_)" .env | sed 's/=.*/=***/' || echo ".env не найден"
} > "$OUTPUT_DIR/project-info.txt"

# Создаем архив
echo "📦 Создание архива..."
cd /tmp
tar -czf stage-configs.tar.gz stage-configs/

echo ""
echo "✅ Конфигурации собраны!"
echo "📁 Архив: /tmp/stage-configs.tar.gz"
echo ""
echo "📋 Содержимое архива:"
tar -tzf stage-configs.tar.gz
echo ""
echo "📤 Для копирования на локальную машину выполните:"
echo "   scp /tmp/stage-configs.tar.gz user@your-local-machine:/path/to/destination/"
echo ""
echo "   Или скопируйте файлы вручную:"
echo "   cat $OUTPUT_DIR/.env.root"
echo "   cat $OUTPUT_DIR/.env.backend"
echo "   cat $OUTPUT_DIR/nginx-nightfall-arena.ru.conf"

