FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json
COPY frontend/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем shared типы
COPY shared ../shared

# Копируем исходный код frontend
COPY frontend .

# Собираем production build
RUN npm run build

# Production образ с Nginx
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
