FROM node:20-alpine AS builder

# Принимаем build arguments
ARG VITE_API_URL
ARG VITE_WS_URL

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости с retry
RUN npm ci || \
    (echo "Retry attempt 1..." && sleep 5 && npm ci) || \
    (echo "Retry attempt 2..." && sleep 10 && npm ci)

# Копируем исходный код
COPY . .

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
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
