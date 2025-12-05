# План настройки Nginx и MinIO

## 1. Настройка и сборка MinIO

### Вариант A: Установка MinIO через Docker (рекомендуется)

**Шаг 1: Создать docker-compose для MinIO**

Создать файл `docker-compose.minio.yml`:

```yaml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    container_name: minio
    restart: unless-stopped
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    networks:
      - app-network

volumes:
  minio-data:

networks:
  app-network:
    external: true
```

**Шаг 2: Запустить MinIO**

```bash
# Создать network если не существует
docker network create app-network

# Запустить MinIO
docker compose -f docker-compose.minio.yml up -d

# Проверить статус
docker ps | grep minio
```

**Шаг 3: Проверить доступность**

```bash
# Проверить API
curl http://178.72.139.236:9000/minio/health/live

# Открыть в браузере Console
# http://178.72.139.236:9001
```

---

### Вариант B: Установка MinIO на сервере (без Docker)

**Шаг 1: Скачать MinIO**

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/
```

**Шаг 2: Создать директорию для данных**

```bash
sudo mkdir -p /data/minio
sudo chown -R $USER:$USER /data/minio
```

**Шаг 3: Создать systemd service**

```bash
sudo nano /etc/systemd/system/minio.service
```

Вставить:

```ini
[Unit]
Description=MinIO
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target

[Service]
Type=notify
WorkingDirectory=/usr/local/
User=root
Group=root

Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=minioadmin"

ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"

Restart=always
LimitNOFILE=65536
TasksMax=infinity
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
```

**Шаг 4: Запустить MinIO**

```bash
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio
sudo systemctl status minio
```

**Шаг 5: Проверить порты**

```bash
sudo netstat -tlnp | grep 9000
sudo netstat -tlnp | grep 9001
```

---

### Настройка MinIO (после запуска)

**Шаг 1: Установить MinIO Client (mc)**

```bash
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

**Шаг 2: Настроить подключение**

```bash
mc alias set myminio http://178.72.139.236:9000 minioadmin minioadmin
```

**Шаг 3: Создать bucket**

```bash
mc mb myminio/elbrus-arena-assets
```

**Шаг 4: Настроить публичный доступ**

```bash
mc anonymous set download myminio/elbrus-arena-assets
```

**Шаг 5: Настроить CORS**

```bash
cat > /tmp/cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"]
    }
  ]
}
EOF

mc anonymous set-json /tmp/cors.json myminio/elbrus-arena-assets
rm /tmp/cors.json
```

**Шаг 6: Проверить настройки**

```bash
# Проверить bucket
mc ls myminio/elbrus-arena-assets/

# Проверить доступность
curl -I http://178.72.139.236:9000/elbrus-arena-assets/
```

---

## 2. Настройка и сборка Nginx

### Шаг 1: Установить Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### Шаг 2: Проверить версию

```bash
nginx -v
```

### Шаг 3: Создать конфигурацию для сайта

```bash
sudo nano /etc/nginx/sites-available/nightfall-arena.ru
```

Вставить конфигурацию:

```nginx
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name nightfall-arena.ru www.nightfall-arena.ru;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nightfall-arena.ru www.nightfall-arena.ru;

    # SSL certificates from Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/nightfall-arena.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nightfall-arena.ru/privkey.pem;

    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # MinIO proxy для статических медиа
    location /minio/ {
        proxy_pass http://178.72.139.236:9000/elbrus-arena-assets/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers для медиа-файлов
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Range, Content-Type' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;

        # Обработка preflight запросов
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Range, Content-Type';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Кеширование медиа-файлов
        expires 30d;
        add_header Cache-Control "public, immutable";

        # Поддержка range requests для видео
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_request_buffering off;

        # Таймауты для больших файлов
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Backend API
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

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket для real-time communication
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Frontend SPA
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

        proxy_intercept_errors on;
        error_page 404 = @frontend;
    }

    # Fallback для SPA
    location @frontend {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Логирование
    access_log /var/log/nginx/nightfall-arena-access.log;
    error_log /var/log/nginx/nightfall-arena-error.log;
}
```

### Шаг 4: Активировать конфигурацию

```bash
sudo ln -s /etc/nginx/sites-available/nightfall-arena.ru /etc/nginx/sites-enabled/
```

### Шаг 5: Проверить конфигурацию

```bash
sudo nginx -t
```

### Шаг 6: Перезагрузить Nginx

```bash
sudo systemctl reload nginx
```

### Шаг 7: Проверить статус

```bash
sudo systemctl status nginx
```

---

## 3. Настройка SSL (Let's Encrypt)

### Шаг 1: Установить Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Шаг 2: Получить сертификат

```bash
sudo certbot --nginx -d nightfall-arena.ru -d www.nightfall-arena.ru
```

### Шаг 3: Проверить автообновление

```bash
sudo certbot renew --dry-run
```

---

## 4. Проверка работы

### Проверить MinIO

```bash
# Через API
curl -I http://178.72.139.236:9000/elbrus-arena-assets/

# Через веб-интерфейс
# Открыть: http://178.72.139.236:9001
```

### Проверить Nginx

```bash
# Проверить доступность через Nginx
curl -I https://nightfall-arena.ru/minio/

# Проверить логи
sudo tail -f /var/log/nginx/nightfall-arena-error.log
```

### Проверить проксирование MinIO

```bash
# Проверить что файлы доступны через Nginx
curl -I https://nightfall-arena.ru/minio/choosePlayer/warrior.png
```

---

## 5. Обновление конфигурации

### После изменения конфигурации Nginx

```bash
# 1. Проверить синтаксис
sudo nginx -t

# 2. Перезагрузить
sudo systemctl reload nginx

# 3. Проверить статус
sudo systemctl status nginx
```

### После изменения MinIO

```bash
# Если MinIO в Docker
docker compose -f docker-compose.minio.yml restart

# Если MinIO как service
sudo systemctl restart minio
sudo systemctl status minio
```

---

## 6. Полезные команды

### Nginx

```bash
# Перезапуск
sudo systemctl restart nginx

# Перезагрузка конфигурации
sudo systemctl reload nginx

# Проверка конфигурации
sudo nginx -t

# Просмотр логов
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### MinIO

```bash
# Проверить статус (Docker)
docker ps | grep minio
docker logs minio

# Проверить статус (Service)
sudo systemctl status minio
sudo journalctl -u minio -f

# Проверить подключение
mc admin info myminio
```

---

## 7. Troubleshooting

### Nginx не запускается

```bash
# Проверить синтаксис
sudo nginx -t

# Проверить порты
sudo netstat -tlnp | grep nginx

# Проверить логи
sudo tail -50 /var/log/nginx/error.log
```

### MinIO недоступен

```bash
# Проверить что MinIO запущен
docker ps | grep minio
# или
sudo systemctl status minio

# Проверить порты
sudo netstat -tlnp | grep 9000
sudo netstat -tlnp | grep 9001

# Проверить логи
docker logs minio
# или
sudo journalctl -u minio -n 50
```

### Файлы не доступны через /minio/

```bash
# 1. Проверить что MinIO работает
curl http://178.72.139.236:9000/elbrus-arena-assets/

# 2. Проверить конфигурацию Nginx
sudo nginx -t

# 3. Проверить логи Nginx
sudo tail -f /var/log/nginx/error.log

# 4. Проверить что файлы в bucket
mc ls myminio/elbrus-arena-assets/
```


