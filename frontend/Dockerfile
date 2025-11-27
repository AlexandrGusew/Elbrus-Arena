FROM node:20-alpine AS builder

# Принимаем build arguments
ARG VITE_API_BASE_URL
ARG VITE_WS_URL

WORKDIR /app

# Настраиваем npm для более надежной работы
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Увеличиваем память для Node.js при сборке
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Копируем package.json из frontend
COPY frontend/package*.json ./

# Устанавливаем зависимости с retry
RUN npm ci || \
    (echo "Retry attempt 1..." && sleep 5 && npm ci) || \
    (echo "Retry attempt 2..." && sleep 10 && npm ci)

# Копируем shared типы (нужны для сборки)
COPY shared ../shared

# Копируем исходный код frontend
COPY frontend .

# Устанавливаем переменные окружения для Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Собираем production build с переменными окружения и логированием
RUN npm run build 2>&1 | tee build.log || (echo "BUILD FAILED" && cat build.log && exit 1)

# Production образ с Nginx
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
