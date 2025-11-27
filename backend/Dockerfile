FROM node:20-alpine AS builder

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Настраиваем npm для более надежной работы
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

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
RUN npx prisma generate

# Собираем проект
RUN npm run build

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

CMD ["node", "dist/app/src/main.js"]
