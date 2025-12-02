#!/bin/bash
# Скрипт для исправления .env файлов на stage сервере

cd /var/www/app

# Root .env - правильная конфигурация для stage
cat > .env <<'ENV_EOF'
# Database Configuration
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"

# JWT Configuration
JWT_SECRET="ваш_длинный_случайный_секретный_ключ_минимум_32_символа"
JWT_EXPIRES_IN="7d"

# Application
NODE_ENV=production
PORT=3000

# Frontend URL (для CORS) - Stage
FRONTEND_URL="https://stage.nightfall-arena.ru"
CORS_ORIGINS="https://nightfall-arena.ru,https://stage.nightfall-arena.ru"

# API URLs для frontend (используются при сборке Docker) - Stage
VITE_API_BASE_URL="/api"
VITE_WS_URL="wss://stage.nightfall-arena.ru"

# MinIO Configuration (используем продакшн MinIO)
VITE_MINIO_URL="https://nightfall-arena.ru/minio"
VITE_MINIO_BUCKET="elbrus-arena-assets"
VITE_USE_MINIO="true"

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN="8271123411:AAFxEHl9jwXScFE4x12oUluhpdcRUuVbcbg"
ENV_EOF

# Backend .env - правильная конфигурация для stage
cat > backend/.env <<'ENV_EOF'
# Database Configuration
DATABASE_URL="postgresql://postgres:@87.228.112.110:5432/postgres?schema=public&sslmode=disable"

# JWT Configuration
JWT_SECRET="ваш_длинный_случайный_секретный_ключ_минимум_32_символа"
JWT_EXPIRES_IN="7d"

# Application
NODE_ENV=production
PORT=3000

# Frontend URL (для CORS) - Stage
FRONTEND_URL="https://stage.nightfall-arena.ru"
CORS_ORIGINS="https://nightfall-arena.ru,https://stage.nightfall-arena.ru"

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN="8271123411:AAFxEHl9jwXScFE4x12oUluhpdcRUuVbcbg"
ENV_EOF

echo "✅ .env файлы исправлены"
echo ""
echo "📋 Root .env:"
cat .env
echo ""
echo "📋 Backend .env:"
cat backend/.env

