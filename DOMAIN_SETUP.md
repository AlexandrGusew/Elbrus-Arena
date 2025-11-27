# Настройка домена nightfall-arena.ru

## Часть 1: Обновление конфигурации для HTTP

### Шаг 1: Подключиться к серверу

```bash
ssh root@nightfall-arena.ru
# или
ssh root@ВАШ_IP_АДРЕС
```

### Шаг 2: Перейти в директорию проекта

```bash
cd /путь/к/проекту
# Например:
# cd /root/elbrusgame
# или
# cd /home/deploy/elbrusgame
```

### Шаг 3: Создать файл .env

```bash
# Создать файл .env на основе примера
nano .env
```

**Скопируйте и вставьте следующее содержимое**, заменив значения на свои:

```env
# Database (ЗАМЕНИТЕ НА СВОИ ДАННЫЕ!)
DATABASE_URL=postgresql://имя_пользователя:пароль@IP_БД:5432/имя_базы

# JWT Secret (ЗАМЕНИТЕ НА ДЛИННЫЙ СЛУЧАЙНЫЙ КЛЮЧ!)
JWT_SECRET=ваш_очень_длинный_случайный_секретный_ключ_измените_в_продакшене
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3000

# Frontend URLs (HTTP для начала)
FRONTEND_URL=http://nightfall-arena.ru
CORS_ORIGINS=http://nightfall-arena.ru

# API URLs для frontend (HTTP для начала)
VITE_API_URL=http://nightfall-arena.ru/api
VITE_WS_URL=ws://nightfall-arena.ru
```

**Сохранить:** `Ctrl+O` → `Enter` → `Ctrl+X`

### Шаг 4: Обновить Nginx конфигурацию

```bash
# Открыть Nginx конфигурацию
sudo nano /etc/nginx/sites-available/elbrusgame
```

**Найдите строку с `server_name` и измените:**

```nginx
server {
    listen 80;
    server_name nightfall-arena.ru www.nightfall-arena.ru;  # ← ИЗМЕНИТЬ ЭТУ СТРОКУ

    # ... остальное оставить без изменений
}
```

**Сохранить:** `Ctrl+O` → `Enter` → `Ctrl+X`

### Шаг 5: Проверить конфигурацию Nginx

```bash
sudo nginx -t
```

Должно быть: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

### Шаг 6: Пересобрать и запустить контейнеры

```bash
# Остановить контейнеры
docker-compose down

# Удалить старые образы (опционально, но рекомендуется)
docker image prune -f

# Пересобрать с новыми переменными окружения
docker-compose build --no-cache

# Запустить контейнеры
docker-compose up -d

# Проверить, что контейнеры запустились
docker-compose ps
```

### Шаг 7: Перезапустить Nginx

```bash
sudo systemctl restart nginx

# Проверить статус
sudo systemctl status nginx
```

### Шаг 8: Проверить работу

```bash
# Проверить логи контейнеров
docker-compose logs -f --tail=50

# Проверить, отвечает ли API
curl http://localhost:3000/api

# Проверить, отвечает ли фронтенд
curl http://localhost:8080
```

Откройте в браузере: `http://nightfall-arena.ru`

---

## Часть 2: Настройка HTTPS с Let's Encrypt

⚠️ **ВАЖНО:** Выполняйте эти шаги ТОЛЬКО после того, как домен работает по HTTP!

### Шаг 1: Установить Certbot

```bash
# Обновить пакеты
sudo apt update

# Установить Certbot для Nginx
sudo apt install certbot python3-certbot-nginx -y
```

### Шаг 2: Получить SSL сертификат

```bash
# Получить сертификат для домена
sudo certbot --nginx -d nightfall-arena.ru -d www.nightfall-arena.ru
```

**Certbot спросит:**

1. Email для уведомлений - введите ваш email
2. Согласие с ToS - введите `Y`
3. Подписка на новости - введите `N` (или `Y` если хотите)
4. Redirect HTTP to HTTPS - введите `2` (автоматическое перенаправление)

### Шаг 3: Обновить .env файл для HTTPS

```bash
nano .env
```

**Измените URL на HTTPS:**

```env
# Frontend URLs (HTTPS)
FRONTEND_URL=https://nightfall-arena.ru
CORS_ORIGINS=https://nightfall-arena.ru

# API URLs для frontend (HTTPS)
VITE_API_URL=https://nightfall-arena.ru/api
VITE_WS_URL=wss://nightfall-arena.ru
```

**Сохранить:** `Ctrl+O` → `Enter` → `Ctrl+X`

### Шаг 4: Пересобрать контейнеры с HTTPS настройками

```bash
# Остановить
docker-compose down

# Пересобрать
docker-compose build --no-cache

# Запустить
docker-compose up -d
```

### Шаг 5: Проверить работу HTTPS

```bash
# Проверить сертификат
sudo certbot certificates

# Проверить автообновление
sudo certbot renew --dry-run
```

Откройте в браузере: `https://nightfall-arena.ru`

### Шаг 6: Настроить автообновление сертификата

Certbot автоматически создает задание cron. Проверить:

```bash
# Проверить таймер автообновления
sudo systemctl status certbot.timer

# Если таймер не активен, включить его
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Проверка конфигурации

### Проверить Nginx конфигурацию после Certbot

```bash
sudo cat /etc/nginx/sites-available/elbrusgame
```

Certbot должен был добавить SSL секции:

```nginx
server {
    server_name nightfall-arena.ru www.nightfall-arena.ru;

    # ... ваши location блоки ...

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nightfall-arena.ru/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nightfall-arena.ru/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.nightfall-arena.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = nightfall-arena.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name nightfall-arena.ru www.nightfall-arena.ru;
    return 404; # managed by Certbot
}
```

---

## Полезные команды для диагностики

```bash
# Проверить статус контейнеров
docker-compose ps

# Просмотреть логи
docker-compose logs -f

# Просмотреть логи конкретного контейнера
docker-compose logs -f backend
docker-compose logs -f frontend

# Проверить переменные окружения в контейнере
docker-compose exec backend env | grep CORS

# Перезапустить только один контейнер
docker-compose restart backend

# Проверить Nginx логи
sudo tail -f /var/log/nginx/elbrusgame_access.log
sudo tail -f /var/log/nginx/elbrusgame_error.log

# Проверить SSL сертификат
openssl s_client -connect nightfall-arena.ru:443 -servername nightfall-arena.ru
```

---

## Чеклист после настройки

- [ ] Домен открывается в браузере
- [ ] HTTPS работает (зеленый замочек)
- [ ] Нет ошибок CORS в консоли браузера (F12 → Console)
- [ ] WebSocket подключается (проверьте в Network → WS)
- [ ] API отвечает на запросы
- [ ] Авторизация работает
- [ ] Игра запускается

---

## Решение проблем

### Если не работает CORS:

```bash
# Проверить переменные окружения в backend
docker-compose exec backend env | grep CORS

# Перезапустить backend
docker-compose restart backend
```

### Если SSL сертификат не получается:

1. Проверьте DNS настройки домена (должен указывать на IP сервера)
2. Проверьте, открыт ли порт 80: `sudo ufw status`
3. Временно остановите Docker: `docker-compose down`
4. Попробуйте снова: `sudo certbot --nginx -d nightfall-arena.ru`
5. Запустите Docker: `docker-compose up -d`

### Если контейнеры не запускаются:

```bash
# Посмотреть логи
docker-compose logs

# Проверить, не заняты ли порты
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8080
```
