# Руководство по развертыванию проекта на удаленном сервере

## Архитектура
- **Сервер 1**: PostgreSQL база данных
- **Сервер 2**: NestJS Backend + React Frontend (через Docker + Nginx)
- **Доменное имя**: будет привязано к Серверу 2

---

## ЭТАП 1: Подготовка Сервера 2

### 1.1 Подключитесь к серверу
```bash
ssh root@ВАШ_IP_СЕРВЕРА_2
# или
ssh ваш_пользователь@ВАШ_IP_СЕРВЕРА_2
```

### 1.2 Обновите систему
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Установите Docker
```bash
# Установка зависимостей
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавление официального GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Проверка установки
docker --version
```

### 1.4 Установите Docker Compose
```bash
# Скачивание последней версии
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Права на выполнение
sudo chmod +x /usr/local/bin/docker-compose

# Проверка
docker-compose --version
```

### 1.5 Добавьте пользователя в группу Docker (опционально)
```bash
sudo usermod -aG docker $USER
# Перелогиньтесь после этого
exit
```

### 1.6 Установите Nginx
```bash
sudo apt install -y nginx

# Проверка статуса
sudo systemctl status nginx
```

### 1.7 Установите Git
```bash
sudo apt install -y git
git --version
```

### 1.8 Настройте файрвол
```bash
# Разрешить SSH (важно!)
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить файрвол
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## ЭТАП 2: Настройка подключения к PostgreSQL

### 2.1 Проверьте доступность БД с Сервера 2
```bash
# Установите PostgreSQL клиент
sudo apt install -y postgresql-client

# Проверьте подключение (замените на ваши данные)
psql -h IP_СЕРВЕРА_1 -U postgres -d postgres
# Введите пароль
```

### 2.2 Настройте PostgreSQL на Сервере 1

**На Сервере 1 выполните:**

```bash
# Подключитесь к Серверу 1
ssh root@IP_СЕРВЕРА_1

# Найдите конфигурационные файлы PostgreSQL
sudo -u postgres psql -c "SHOW config_file;"
sudo -u postgres psql -c "SHOW hba_file;"
```

**Отредактируйте postgresql.conf:**
```bash
sudo nano /etc/postgresql/[VERSION]/main/postgresql.conf

# Найдите строку listen_addresses и измените на:
listen_addresses = '*'

# Или укажите конкретный IP Сервера 2:
listen_addresses = 'localhost,IP_СЕРВЕРА_2'
```

**Отредактируйте pg_hba.conf:**
```bash
sudo nano /etc/postgresql/[VERSION]/main/pg_hba.conf

# Добавьте в конец файла (замените IP_СЕРВЕРА_2):
host    all             all             IP_СЕРВЕРА_2/32         md5
```

**Перезапустите PostgreSQL:**
```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### 2.3 Создайте базу данных и пользователя

**На Сервере 1:**
```bash
sudo -u postgres psql

-- Создайте пользователя
CREATE USER elbrusgame WITH PASSWORD 'ваш_сильный_пароль';

-- Создайте базу данных
CREATE DATABASE elbrusgame_db OWNER elbrusgame;

-- Дайте права
GRANT ALL PRIVILEGES ON DATABASE elbrusgame_db TO elbrusgame;

-- Выход
\q
```

### 2.4 Проверьте подключение с Сервера 2
```bash
# На Сервере 2
psql -h IP_СЕРВЕРА_1 -U elbrusgame -d elbrusgame_db
# Должно подключиться успешно
```

---

## ЭТАП 3: Развертывание приложения через Docker

### 3.1 Клонируйте репозиторий на Сервер 2
```bash
# Создайте директорию для проекта
mkdir -p /var/www
cd /var/www

# Клонируйте репозиторий
git clone https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ.git app
cd app
```

### 3.2 Создайте Dockerfile для Backend

**Создайте файл `/var/www/app/backend/Dockerfile`:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем проект
RUN npm run build

# Production образ
FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Копируем Prisma schema для миграций
COPY prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
```

### 3.3 Создайте Dockerfile для Frontend

**Создайте файл `/var/www/app/frontend/Dockerfile`:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем production build
RUN npm run build

# Production образ с Nginx
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.4 Создайте nginx.conf для контейнера Frontend

**Создайте файл `/var/www/app/frontend/nginx.conf`:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Поддержка SPA роутинга
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3.5 Создайте docker-compose.yml

**Создайте файл `/var/www/app/docker-compose.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: elbrusgame-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://elbrusgame:ваш_пароль@IP_СЕРВЕРА_1:5432/elbrusgame_db
      - JWT_SECRET=ваш_очень_длинный_и_случайный_секретный_ключ_для_jwt
      - PORT=3000
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: elbrusgame-frontend
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 3.6 Создайте .env файл для продакшена (опционально)

**Создайте `/var/www/app/.env.production`:**
```env
# Database
DATABASE_URL=postgresql://elbrusgame:ваш_пароль@IP_СЕРВЕРА_1:5432/elbrusgame_db

# JWT
JWT_SECRET=ваш_очень_длинный_и_случайный_секретный_ключ_для_jwt
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3000

# Frontend URL (после настройки домена измените)
FRONTEND_URL=http://ВАШ_IP_СЕРВЕРА_2
```

### 3.7 Обновите конфигурацию Frontend для API

**Создайте файл `/var/www/app/frontend/.env.production`:**
```env
VITE_API_URL=http://ВАШ_IP_СЕРВЕРА_2/api
VITE_WS_URL=ws://ВАШ_IP_СЕРВЕРА_2
```

**Или отредактируйте axios config в коде:**
```typescript
// frontend/src/api/axios.ts (пример)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 3.8 Примените миграции Prisma

```bash
cd /var/www/app/backend

# Создайте миграции (если еще не созданы)
npx prisma migrate dev --name init

# Или примените существующие миграции
npx prisma migrate deploy
```

### 3.9 Соберите и запустите контейнеры

```bash
cd /var/www/app

# Соберите образы
docker-compose build

# Запустите контейнеры
docker-compose up -d

# Проверьте логи
docker-compose logs -f

# Проверьте статус
docker-compose ps
```

### 3.10 Проверьте работу приложения

```bash
# Проверка backend
curl http://localhost:3000

# Проверка frontend
curl http://localhost:8080

# Проверка из браузера
# Откройте: http://ВАШ_IP_СЕРВЕРА_2:8080
```

---

## ЭТАП 4: Настройка Nginx как reverse proxy

### 4.1 Создайте конфигурацию Nginx

**Создайте файл `/etc/nginx/sites-available/elbrusgame`:**
```nginx
# Upstream для backend
upstream backend {
    server localhost:3000;
}

# Upstream для frontend
upstream frontend {
    server localhost:8080;
}

server {
    listen 80;
    server_name ВАШ_IP_СЕРВЕРА_2;

    # Ограничение размера загружаемых файлов
    client_max_body_size 10M;

    # Логи
    access_log /var/log/nginx/elbrusgame_access.log;
    error_log /var/log/nginx/elbrusgame_error.log;

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket для Socket.IO
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # WebSocket таймауты
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.2 Активируйте конфигурацию

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/elbrusgame /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx

# Проверьте статус
sudo systemctl status nginx
```

### 4.3 Проверьте работу через Nginx

Откройте в браузере:
- `http://ВАШ_IP_СЕРВЕРА_2` - должен открыться frontend
- `http://ВАШ_IP_СЕРВЕРА_2/api` - должен ответить backend

---

## ЭТАП 5: Подключение доменного имени и SSL

### 5.1 Настройте DNS записи

В панели управления вашего регистратора доменов (например, Namecheap, GoDaddy, REG.RU):

1. Найдите раздел DNS Management / DNS Settings
2. Добавьте A-запись:
   ```
   Type: A
   Host: @
   Value: ВАШ_IP_СЕРВЕРА_2
   TTL: 3600 (или Auto)
   ```

3. (Опционально) Добавьте запись для www:
   ```
   Type: A
   Host: www
   Value: ВАШ_IP_СЕРВЕРА_2
   TTL: 3600
   ```

4. Сохраните изменения

### 5.2 Дождитесь распространения DNS

```bash
# Проверьте DNS (может занять от 5 минут до 48 часов)
nslookup ваш-домен.com

# Или используйте dig
dig ваш-домен.com

# Онлайн проверка
# https://dnschecker.org
```

### 5.3 Установите Certbot для Let's Encrypt SSL

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com

# Следуйте инструкциям:
# - Введите email
# - Согласитесь с условиями
# - Выберите опцию 2 (redirect HTTP to HTTPS)
```

### 5.4 Обновите конфигурацию Nginx для домена

**Certbot автоматически обновит файл, но проверьте `/etc/nginx/sites-available/elbrusgame`:**
```nginx
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name ваш-домен.com www.ваш-домен.com;

    # SSL certificates (автоматически добавлено Certbot)
    ssl_certificate /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Остальная конфигурация как в ЭТАПЕ 4.1
    client_max_body_size 10M;

    access_log /var/log/nginx/elbrusgame_access.log;
    error_log /var/log/nginx/elbrusgame_error.log;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.5 Обновите переменные окружения

**Обновите `/var/www/app/docker-compose.yml`:**
```yaml
services:
  backend:
    environment:
      - FRONTEND_URL=https://ваш-домен.com
      - CORS_ORIGIN=https://ваш-домен.com
```

**Обновите `/var/www/app/frontend/.env.production`:**
```env
VITE_API_URL=https://ваш-домен.com/api
VITE_WS_URL=wss://ваш-домен.com
```

### 5.6 Пересоберите и перезапустите контейнеры

```bash
cd /var/www/app

# Пересобрать frontend с новыми переменными
docker-compose build frontend

# Перезапустить все сервисы
docker-compose down
docker-compose up -d

# Проверить логи
docker-compose logs -f
```

### 5.7 Проверьте Nginx и перезапустите

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 5.8 Настройте автообновление SSL

```bash
# Certbot автоматически добавляет cron job
# Проверьте:
sudo systemctl status certbot.timer

# Или проверьте вручную:
sudo certbot renew --dry-run
```

---

## ЭТАП 6: Финальная проверка

### 6.1 Проверьте все сервисы

```bash
# Docker контейнеры
docker-compose ps

# Nginx
sudo systemctl status nginx

# Логи
docker-compose logs backend
docker-compose logs frontend
sudo tail -f /var/log/nginx/elbrusgame_error.log
```

### 6.2 Проверьте в браузере

1. Откройте `https://ваш-домен.com`
2. Проверьте SSL сертификат (зеленый замок)
3. Проверьте работу API
4. Проверьте WebSocket соединение (если используется)

### 6.3 Проверьте производительность

```bash
# Тест SSL
curl -I https://ваш-домен.com

# Тест API
curl https://ваш-домен.com/api/health
```

---

## Полезные команды для управления

### Docker команды
```bash
# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend

# Перезапуск сервисов
docker-compose restart backend
docker-compose restart frontend

# Остановка
docker-compose down

# Запуск
docker-compose up -d

# Пересборка
docker-compose build --no-cache
docker-compose up -d --force-recreate

# Очистка
docker system prune -a
```

### Nginx команды
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Просмотр логов
sudo tail -f /var/log/nginx/elbrusgame_access.log
sudo tail -f /var/log/nginx/elbrusgame_error.log
```

### Обновление приложения из Git
```bash
cd /var/www/app

# Получить обновления
git pull origin main

# Пересобрать и перезапустить
docker-compose build
docker-compose down
docker-compose up -d
```

### Применение миграций БД
```bash
# Войти в контейнер backend
docker exec -it elbrusgame-backend sh

# Внутри контейнера
npx prisma migrate deploy

# Выход
exit
```

---

## Troubleshooting

### Проблема: Контейнеры не запускаются
```bash
# Проверьте логи
docker-compose logs

# Проверьте использование портов
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8080

# Проверьте права на файлы
ls -la /var/www/app
```

### Проблема: Не подключается к БД
```bash
# Проверьте подключение
docker exec -it elbrusgame-backend sh
psql -h IP_СЕРВЕРА_1 -U elbrusgame -d elbrusgame_db

# Проверьте переменные окружения
docker exec elbrusgame-backend env | grep DATABASE
```

### Проблема: Nginx 502 Bad Gateway
```bash
# Проверьте, что контейнеры работают
docker-compose ps

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/elbrusgame_error.log

# Проверьте upstream
curl http://localhost:3000
curl http://localhost:8080
```

### Проблема: SSL не работает
```bash
# Перевыпустите сертификат
sudo certbot renew --force-renewal

# Проверьте конфигурацию
sudo nginx -t

# Проверьте сертификаты
sudo ls -la /etc/letsencrypt/live/ваш-домен.com/
```

---

## Безопасность

### Дополнительные рекомендации

1. **Измените SSH порт:**
```bash
sudo nano /etc/ssh/sshd_config
# Port 2222
sudo systemctl restart sshd
sudo ufw allow 2222/tcp
```

2. **Отключите root логин через SSH:**
```bash
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
sudo systemctl restart sshd
```

3. **Настройте fail2ban:**
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

4. **Регулярно обновляйте систему:**
```bash
sudo apt update && sudo apt upgrade -y
```

5. **Используйте сильные пароли для БД**

6. **Настройте регулярные бэкапы БД**

---

## Готово!

Ваше приложение теперь развернуто и доступно по адресу `https://ваш-домен.com` 🚀
