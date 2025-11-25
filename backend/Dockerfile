FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY backend/package*.json ./

# Устанавливаем зависимости
RUN npm ci

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

WORKDIR /app

# Копируем package.json
COPY backend/package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем shared типы для runtime
COPY shared ../shared

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Копируем Prisma schema для миграций
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/backend/src/main.js"]
