FROM node:20-alpine AS builder

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости с retry
RUN npm ci || \
    (echo "Retry attempt 1..." && sleep 5 && npm ci) || \
    (echo "Retry attempt 2..." && sleep 10 && npm ci)

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем проект
RUN npm run build

# Production образ
FROM node:20-alpine

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --omit=dev || \
    (echo "Retry attempt 1..." && sleep 5 && npm ci --omit=dev) || \
    (echo "Retry attempt 2..." && sleep 10 && npm ci --omit=dev)

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Копируем Prisma schema для миграций
COPY prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
