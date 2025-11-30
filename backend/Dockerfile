FROM node:20-alpine AS builder

# Устанавливаем OpenSSL для Prisma и build tools для компиляции bcrypt
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /app

# Настраиваем npm для более надежной работы
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Увеличиваем память для Node.js при сборке
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Копируем package.json из backend
COPY backend/package*.json ./

# Устанавливаем зависимости с retry
RUN npm ci || \
    (echo "Retry attempt 1..." && sleep 5 && npm ci) || \
    (echo "Retry attempt 2..." && sleep 10 && npm ci)

# Копируем shared типы (нужны для сборки)
COPY shared ../shared

# Копируем исходный код backend
COPY backend .

# Генерируем Prisma Client
RUN echo "=== Generating Prisma Client ===" && \
    npx prisma generate && \
    echo "=== Prisma Client generated ==="

# Собираем проект (может занять несколько минут)
RUN echo "=== Starting NestJS build (this may take 2-5 minutes) ===" && \
    npm run build 2>&1 | tee build.log && \
    echo "=== Build completed ==="

# Проверяем, что сборка прошла успешно
RUN echo "=== Checking dist directory ===" && \
    ls -la dist/ && \
    echo "=== Looking for main files ===" && \
    find dist -name "main*" -type f && \
    echo "=== All files in dist ===" && \
    find dist -type f

# Production образ
FROM node:20-alpine

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Настраиваем npm для более надежной работы
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Копируем package.json из backend
COPY backend/package*.json ./

# Устанавливаем только production зависимости с retry
RUN npm ci --omit=dev || \
    (echo "Retry attempt 1..." && sleep 5 && npm ci --omit=dev) || \
    (echo "Retry attempt 2..." && sleep 10 && npm ci --omit=dev)

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Копируем Prisma schema для миграций (из backend/prisma)
COPY backend/prisma ./prisma

EXPOSE 3000

# Создаем startup script для запуска миграций и приложения
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "=== Container startup script ==="' >> /app/start.sh && \
    echo 'echo "Working directory: $(pwd)"' >> /app/start.sh && \
    echo 'echo "=== Checking build output structure ==="' >> /app/start.sh && \
    echo 'find dist -name "main.js" -type f 2>/dev/null | head -5 || echo "No main.js found yet"' >> /app/start.sh && \
    echo 'echo "=== Running database migrations ==="' >> /app/start.sh && \
    echo 'npx prisma migrate deploy 2>&1 || echo "⚠️  Warning: Migration failed or already applied, continuing..."' >> /app/start.sh && \
    echo 'echo "=== Determining application entry point ==="' >> /app/start.sh && \
    echo 'MAIN_FILE=""' >> /app/start.sh && \
    echo 'if [ -f "dist/main.js" ]; then' >> /app/start.sh && \
    echo '  MAIN_FILE="dist/main.js"' >> /app/start.sh && \
    echo 'elif [ -f "dist/src/main.js" ]; then' >> /app/start.sh && \
    echo '  MAIN_FILE="dist/src/main.js"' >> /app/start.sh && \
    echo 'elif [ -f "dist/backend/src/main.js" ]; then' >> /app/start.sh && \
    echo '  MAIN_FILE="dist/backend/src/main.js"' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "❌ Error: main.js not found in expected locations"' >> /app/start.sh && \
    echo '  echo "Searching for main.js files..."' >> /app/start.sh && \
    echo '  find dist -name "main.js" -type f 2>/dev/null || echo "No main.js files found"' >> /app/start.sh && \
    echo '  echo "Available files in dist:"' >> /app/start.sh && \
    echo '  find dist -type f | head -20' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "✅ Found entry point: $MAIN_FILE"' >> /app/start.sh && \
    echo 'echo "=== Starting application ==="' >> /app/start.sh && \
    echo 'exec node "$MAIN_FILE"' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
