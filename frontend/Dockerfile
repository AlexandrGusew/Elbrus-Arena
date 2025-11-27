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

# Устанавливаем зависимости с retry и логированием
RUN echo "=== Installing dependencies (attempt 1) ===" && \
    (npm ci 2>&1 | tee npm-install.log && echo "=== Success on first attempt ===") || \
    (echo "=== First attempt failed, retrying in 5 seconds... ===" && \
     sleep 5 && \
     npm ci 2>&1 | tee -a npm-install.log && echo "=== Success on second attempt ===") || \
    (echo "=== Second attempt failed, retrying in 10 seconds... ===" && \
     sleep 10 && \
     npm ci 2>&1 | tee -a npm-install.log && echo "=== Success on third attempt ===") || \
    (echo "=== npm ci failed 3 times, trying npm install as fallback ===" && \
     npm install 2>&1 | tee -a npm-install.log && echo "=== Success with npm install ===") || \
    (echo "=== All installation attempts failed ===" && \
     echo "=== Last 50 lines of log ===" && \
     tail -50 npm-install.log && \
     exit 1) && \
    echo "=== Dependencies installed successfully ===" && \
    echo "=== Checking node_modules ===" && \
    if [ ! -d "node_modules" ]; then \
        echo "ERROR: node_modules directory not found!" && \
        echo "=== Full installation log ===" && \
        cat npm-install.log && \
        exit 1; \
    fi && \
    echo "=== Installation verified ===" && \
    echo "=== node_modules size ===" && \
    du -sh node_modules/ && \
    echo "=== Number of packages ===" && \
    ls -1 node_modules | wc -l

# Копируем shared типы (нужны для сборки)
RUN echo "=== Copying shared types ===" && \
    echo "Shared directory will be copied to ../shared"

COPY shared ../shared

# Копируем конфигурационные файлы (быстро)
RUN echo "=== Step 1/3: Copying config files ==="
COPY frontend/vite.config.ts frontend/tsconfig*.json frontend/index.html ./

# Копируем public директорию (обычно небольшая)
RUN echo "=== Step 2/3: Copying public directory ==="
COPY frontend/public ./public 2>/dev/null || echo "No public directory"

# Копируем src (включая 63MB медиа - займет 1-2 минуты)
RUN echo "=== Step 3/3: Copying source files (63MB assets, please wait) ==="
COPY frontend/src ./src

RUN echo "=== All files copied successfully ===" && \
    ls -lah && \
    echo "Source files:" && \
    find src -type f | wc -l && \
    echo "Total size:" && \
    du -sh src/ && \
    echo "=== Ready to build ==="

# Устанавливаем переменные окружения для Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Собираем production build с проверкой результата
RUN echo "=== Starting build ===" && \
    npm run build 2>&1 | tee build.log && \
    echo "=== Checking build result ===" && \
    if [ ! -d "dist" ]; then \
        echo "ERROR: dist directory not found!" && \
        echo "=== Build log (last 100 lines) ===" && \
        tail -100 build.log && \
        echo "=== Current directory contents ===" && \
        ls -lah && \
        exit 1; \
    fi && \
    echo "=== Build successful ===" && \
    echo "=== Dist directory size ===" && \
    du -sh dist/ && \
    echo "=== Dist contents (first 20 files) ===" && \
    find dist -type f | head -20

# Production образ с Nginx
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
