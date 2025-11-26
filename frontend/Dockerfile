FROM node:20-alpine AS builder

# Принимаем build arguments
ARG VITE_API_URL
ARG VITE_WS_URL

WORKDIR /app

# Настраиваем npm для более надежной работы
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Копируем package.json
COPY frontend/package*.json ./

# Устанавливаем зависимости с retry при сетевых ошибках
RUN npm ci || \
    (echo "First attempt failed, retrying..." && sleep 5 && npm ci) || \
    (echo "Second attempt failed, retrying..." && sleep 10 && npm ci) || \
    (echo "Using npm install as fallback..." && npm install)

# Копируем shared типы
COPY shared ../shared

# Копируем исходный код frontend
COPY frontend .

# Устанавливаем переменные окружения для Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Собираем production build с переменными окружения
RUN npm run build

# Production образ с Nginx
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
