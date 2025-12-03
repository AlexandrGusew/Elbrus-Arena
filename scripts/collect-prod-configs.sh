#!/bin/bash
# Скрипт для сбора конфигураций с продакшн сервера
# Использование: ./scripts/collect-prod-configs.sh

set -e

PROD_SERVER="178.72.139.236"
PROD_USER="root"  # Измените если используется другой пользователь
OUTPUT_DIR="./prod-configs"

echo "📥 Сбор конфигураций с продакшн сервера $PROD_SERVER..."

# Создаем директорию для конфигураций
mkdir -p "$OUTPUT_DIR"

# Определяем путь к проекту на продакшн (обычно /var/www/app или /root/app)
PROJECT_PATH="/var/www/app"

echo "🔍 Поиск проекта на продакшн сервере..."

# Собираем конфигурации
echo "📋 Копирование .env файлов..."
scp "$PROD_USER@$PROD_SERVER:$PROJECT_PATH/.env" "$OUTPUT_DIR/.env.root" 2>/dev/null || echo "⚠️  Root .env не найден"
scp "$PROD_USER@$PROD_SERVER:$PROJECT_PATH/backend/.env" "$OUTPUT_DIR/.env.backend" 2>/dev/null || echo "⚠️  Backend .env не найден"

echo "📋 Копирование docker-compose.yml..."
scp "$PROD_USER@$PROD_SERVER:$PROJECT_PATH/docker-compose.yml" "$OUTPUT_DIR/docker-compose.yml" 2>/dev/null || echo "⚠️  docker-compose.yml не найден"

echo "📋 Копирование nginx конфигурации..."
# Ищем nginx конфигурацию
scp "$PROD_USER@$PROD_SERVER:/etc/nginx/sites-available/nightfall-arena.ru" "$OUTPUT_DIR/nginx-nightfall-arena.ru.conf" 2>/dev/null || \
scp "$PROD_USER@$PROD_SERVER:/etc/nginx/sites-available/default" "$OUTPUT_DIR/nginx-default.conf" 2>/dev/null || \
scp "$PROD_USER@$PROD_SERVER:/etc/nginx/nginx.conf" "$OUTPUT_DIR/nginx.conf" 2>/dev/null || echo "⚠️  Nginx конфигурация не найдена"

echo "📋 Получение структуры проекта..."
ssh "$PROD_USER@$PROD_SERVER" "cd $PROJECT_PATH && pwd && ls -la" > "$OUTPUT_DIR/project-structure.txt" 2>/dev/null || echo "⚠️  Не удалось получить структуру"

echo "📋 Получение информации о Docker контейнерах..."
ssh "$PROD_USER@$PROD_SERVER" "cd $PROJECT_PATH && docker compose ps" > "$OUTPUT_DIR/docker-containers.txt" 2>/dev/null || echo "⚠️  Не удалось получить информацию о контейнерах"

echo "✅ Конфигурации собраны в директорию: $OUTPUT_DIR"
echo ""
echo "📁 Содержимое:"
ls -la "$OUTPUT_DIR"

