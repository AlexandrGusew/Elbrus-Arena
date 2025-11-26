FROM node:20-alpine AS builder

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Настраиваем npm для более надежной работы
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Копируем package.json и package-lock.json
COPY backend/package*.json ./

# Устанавливаем зависимости с retry при сетевых ошибках
RUN npm ci || \
    (echo "First attempt failed, retrying..." && sleep 5 && npm ci) || \
    (echo "Second attempt failed, retrying..." && sleep 10 && npm ci) || \
    (echo "Using npm install as fallback..." && npm install)

# Копируем shared типы
COPY shared ../shared

# Копируем исходный код backend
COPY backend .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем проект
RUN npm run build || (echo "BUILD FAILED" && exit 1)

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

# Копируем package.json
COPY backend/package*.json ./

# Устанавливаем только production зависимости с retry
RUN npm ci --only=production || \
    (echo "First attempt failed, retrying..." && sleep 5 && npm ci --only=production) || \
    (echo "Second attempt failed, retrying..." && sleep 10 && npm ci --only=production) || \
    (echo "Using npm install as fallback..." && npm install --only=production)

# Копируем shared типы для runtime
COPY shared ../shared

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Копируем Prisma schema для миграций
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Проверяем структуру dist при запуске
RUN echo "=== Final dist structure ===" && \
    find dist -type f -name "*.js" | head -20

CMD ["node", "dist/main.js"]
