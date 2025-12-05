# Руководство по SSH доступу

## Проблема: Permission denied (publickey)

Эта ошибка означает, что сервер требует SSH ключ для аутентификации.

## Решение 1: Использовать существующий SSH ключ

Если у вас уже есть SSH ключ:

```bash
# Проверьте наличие ключей
ls -la ~/.ssh/

# Используйте ключ при подключении
ssh -i ~/.ssh/id_rsa root@178.72.139.236

# Или для scp
scp -i ~/.ssh/id_rsa file.txt root@178.72.139.236:/tmp/
```

## Решение 2: Создать новый SSH ключ

Если у вас нет SSH ключа:

```bash
# Создайте новый SSH ключ
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Скопируйте публичный ключ на сервер
ssh-copy-id root@178.72.139.236

# Или вручную
cat ~/.ssh/id_rsa.pub | ssh root@178.72.139.236 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Решение 3: Выполнить команды напрямую на сервере

Если у вас уже есть доступ к серверу (например, через консоль провайдера), выполните команды напрямую:

### На продакшн сервере (178.72.139.236):

```bash
# 1. Перейдите в директорию проекта
cd /var/www/app  # или другой путь где находится проект

# 2. Создайте скрипт для сбора конфигураций
cat > /tmp/get-configs.sh <<'EOF'
#!/bin/bash
mkdir -p /tmp/stage-configs
cd /var/www/app  # измените если нужно

# Копируем .env файлы
[ -f ".env" ] && cp .env /tmp/stage-configs/.env.root
[ -f "backend/.env" ] && cp backend/.env /tmp/stage-configs/.env.backend

# Копируем docker-compose
[ -f "docker-compose.yml" ] && cp docker-compose.yml /tmp/stage-configs/

# Копируем nginx конфигурацию
[ -f "/etc/nginx/sites-available/nightfall-arena.ru" ] && \
    cp /etc/nginx/sites-available/nightfall-arena.ru /tmp/stage-configs/nginx.conf

# Создаем архив
cd /tmp
tar -czf stage-configs.tar.gz stage-configs/
echo "Архив создан: /tmp/stage-configs.tar.gz"
EOF

chmod +x /tmp/get-configs.sh
/tmp/get-configs.sh

# 3. Просмотрите содержимое
cat /tmp/stage-configs/.env.root
cat /tmp/stage-configs/.env.backend
cat /tmp/stage-configs/nginx.conf
```

### Альтернатива: Использовать готовый скрипт

Скопируйте содержимое файла `scripts/get-prod-configs-direct.sh` на сервер и выполните:

```bash
# На продакшн сервере
nano /tmp/get-configs.sh
# Вставьте содержимое scripts/get-prod-configs-direct.sh
chmod +x /tmp/get-configs.sh
/tmp/get-configs.sh
```

## Решение 4: Использовать парольную аутентификацию (если разрешено)

Если на сервере разрешена парольная аутентификация:

```bash
# Подключитесь с паролем
ssh -o PreferredAuthentications=password root@178.72.139.236
```

## Решение 5: Использовать веб-консоль провайдера

Многие хостинг-провайдеры предоставляют веб-консоль для доступа к серверу:
- VPS панель управления
- Cloud консоль (AWS, DigitalOcean, etc.)
- Web SSH в панели хостинга

## Быстрый способ: Выполнить команды вручную

Если у вас есть доступ к серверу через любой способ, просто выполните команды из `QUICK_START_STAGE.md` напрямую на сервере.

### Шаг 1: На продакшн сервере - получить конфигурации

```bash
# Найдите проект
find / -name "docker-compose.yml" -type f 2>/dev/null | grep -v proc | head -5

# Перейдите в директорию проекта (например /var/www/app)
cd /var/www/app

# Просмотрите .env файлы
cat .env
cat backend/.env

# Просмотрите nginx конфигурацию
cat /etc/nginx/sites-available/nightfall-arena.ru
```

Запишите значения из этих файлов - они понадобятся для настройки stage.

### Шаг 2: На stage сервере - настроить окружение

Используйте значения из продакшн для создания `.env` файлов на stage сервере.

## Полезные команды для диагностики

```bash
# Проверка SSH подключения
ssh -v root@178.72.139.236

# Проверка доступных методов аутентификации
ssh -o PreferredAuthentications=keyboard-interactive,password root@178.72.139.236

# Проверка существующих ключей
ls -la ~/.ssh/
cat ~/.ssh/id_rsa.pub
```

