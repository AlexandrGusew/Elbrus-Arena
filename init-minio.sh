#!/bin/bash
# Скрипт инициализации MinIO

set -e

echo "=== Инициализация MinIO ==="

# Настройки
MINIO_ALIAS="myminio"
MINIO_ENDPOINT="http://localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"
BUCKET_NAME="elbrus-arena-assets"

# Проверка, установлен ли mc (MinIO Client)
if ! command -v mc &> /dev/null; then
    echo "❌ MinIO Client (mc) не установлен"
    echo "Установите его: https://min.io/docs/minio/linux/reference/minio-mc.html"
    echo ""
    echo "Для Linux/Mac:"
    echo "curl https://dl.min.io/client/mc/release/linux-amd64/mc -o mc"
    echo "chmod +x mc"
    echo "sudo mv mc /usr/local/bin/"
    exit 1
fi

echo "✅ MinIO Client найден"

# Ждём запуска MinIO
echo "⏳ Ожидание запуска MinIO..."
sleep 5

# Настройка alias
echo "🔧 Настройка alias для MinIO..."
mc alias set $MINIO_ALIAS $MINIO_ENDPOINT $MINIO_ACCESS_KEY $MINIO_SECRET_KEY

# Создание bucket
echo "📦 Создание bucket: $BUCKET_NAME..."
mc mb $MINIO_ALIAS/$BUCKET_NAME --ignore-existing

# Установка публичного доступа для чтения
echo "🔓 Установка публичного доступа на чтение..."
mc anonymous set download $MINIO_ALIAS/$BUCKET_NAME

# Применение CORS политики
if [ -f "minio-cors.json" ]; then
    echo "🌐 Применение CORS политики..."
    mc anonymous set-json minio-cors.json $MINIO_ALIAS/$BUCKET_NAME
else
    echo "⚠️  Файл minio-cors.json не найден, пропускаем настройку CORS"
fi

# Загрузка файлов (если папка asset существует)
if [ -d "frontend/asset" ]; then
    echo "📤 Загрузка медиа-файлов из frontend/asset..."
    mc cp --recursive frontend/asset/ $MINIO_ALIAS/$BUCKET_NAME/asset/
    echo "✅ Файлы загружены"
elif [ -d "asset" ]; then
    echo "📤 Загрузка медиа-файлов из asset..."
    mc cp --recursive asset/ $MINIO_ALIAS/$BUCKET_NAME/asset/
    echo "✅ Файлы загружены"
else
    echo "⚠️  Папка asset не найдена"
    echo "Создайте папку frontend/asset и поместите туда медиа-файлы"
    echo "Структура должна быть:"
    echo "  frontend/asset/createCharacter/..."
    echo "  frontend/asset/dashboard/..."
    echo "  и т.д."
fi

echo ""
echo "✅ Инициализация завершена!"
echo ""
echo "📊 Консоль MinIO доступна по адресу: http://localhost:9001"
echo "   Логин: minioadmin"
echo "   Пароль: minioadmin123"
echo ""
echo "🗂️  Bucket: $BUCKET_NAME"
echo "🌐 Endpoint: $MINIO_ENDPOINT"
