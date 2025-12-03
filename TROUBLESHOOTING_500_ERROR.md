# Диагностика ошибки 500 на /api/auth/login

## Симптомы

- `Failed to load resource: the server responded with a status of 500 (Internal Server Error)` на `/api/auth/login`
- `❌ Login failed: Object` в консоли браузера

## Возможные причины и решения

### 1. Проблема с базой данных (Prisma)

**Симптомы:**
- Ошибка подключения к базе данных
- Prisma не может выполнить запрос

**Решение:**

```bash
# На сервере проверьте подключение к БД
ssh root@178.72.139.236  # или stage сервер
cd /var/www/app

# Проверьте .env файл
cat backend/.env | grep DATABASE_URL

# Проверьте подключение через Prisma
docker compose run --rm backend npx prisma db pull

# Проверьте миграции
docker compose run --rm backend npx prisma migrate status
```

**Проверка:**
- Убедитесь что `DATABASE_URL` правильный в `.env` файле
- Проверьте что база данных доступна с сервера
- Убедитесь что миграции применены

### 2. Проблема с JWT_SECRET

**Симптомы:**
- JWT_SECRET не настроен или невалидный
- Ошибка при генерации токенов

**Решение:**

```bash
# На сервере проверьте JWT_SECRET
cd /var/www/app
cat backend/.env | grep JWT_SECRET

# JWT_SECRET должен быть установлен и не пустой
# Если пустой, создайте новый:
# JWT_SECRET=$(openssl rand -base64 32)
```

**Проверка:**
- `JWT_SECRET` должен быть в `.env` файле
- Длина минимум 32 символа
- Не должен быть значением по умолчанию `'your-secret-key-change-in-production'`

### 3. Проблема с JWT_REFRESH_SECRET

**Симптомы:**
- Ошибка при генерации refresh token

**Решение:**

```bash
# Проверьте JWT_REFRESH_SECRET в .env
cat backend/.env | grep JWT_REFRESH_SECRET

# Если не установлен, добавьте в .env:
# JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

### 4. Проблема с cookie настройками

**Симптомы:**
- Ошибка при установке cookie с refresh token
- Проблемы с `secure` флагом в production

**Решение:**

Проверьте настройки в `auth.controller.ts`:
```typescript
response.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Должно быть true в production
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
```

### 5. Проблема с пользователем в базе данных

**Симптомы:**
- Пользователь существует, но нет пароля
- Проблемы с хешированием пароля

**Решение:**

```bash
# Проверьте пользователя в базе данных
docker compose run --rm backend npx prisma studio
# Или через SQL:
docker compose run --rm backend npx prisma db execute --stdin
# SELECT id, username, password FROM "User" WHERE username = 'your_username';
```

## Диагностика через логи

### Просмотр логов бэкенда

```bash
# На production сервере
ssh root@178.72.139.236
cd /var/www/app
docker compose logs backend --tail=100 -f

# На stage сервере
ssh root@178.72.152.120
cd /var/www/app
docker compose logs backend --tail=100 -f
```

### Что искать в логах:

1. **Ошибки подключения к БД:**
   ```
   Can't reach database server
   P1001: Can't reach database server
   ```

2. **Ошибки Prisma:**
   ```
   PrismaClientKnownRequestError
   PrismaClientValidationError
   ```

3. **Ошибки JWT:**
   ```
   JWT_SECRET is not defined
   jwt.sign is not a function
   ```

4. **Ошибки bcrypt:**
   ```
   bcrypt.compare is not a function
   ```

## Быстрая проверка

Выполните на сервере:

```bash
# 1. Проверьте что контейнеры запущены
docker compose ps

# 2. Проверьте логи бэкенда
docker compose logs backend --tail=50

# 3. Проверьте .env файлы
cat backend/.env | grep -E "DATABASE_URL|JWT_SECRET|JWT_REFRESH_SECRET"

# 4. Проверьте подключение к БД
docker compose run --rm backend npx prisma db execute --stdin <<< "SELECT 1;"

# 5. Проверьте что API доступен
curl http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'
```

## Исправление через код

Если проблема в коде, проверьте:

1. **auth.service.ts** - метод `login()` должен обрабатывать все ошибки
2. **auth.controller.ts** - должен иметь try-catch (уже добавлен)
3. **Проверьте что PrismaService правильно инжектирован**

## Временное решение

Если нужно быстро восстановить работу:

```bash
# Перезапустите контейнеры
docker compose restart backend

# Или полный перезапуск
docker compose down
docker compose up -d

# Проверьте статус
docker compose ps
docker compose logs backend -f
```

## Проверка после исправления

1. Откройте браузер с DevTools (F12)
2. Перейдите на страницу логина
3. Попробуйте войти
4. Проверьте:
   - Network tab - статус запроса `/api/auth/login`
   - Console - нет ли ошибок
   - Response - что возвращает сервер

## Контакты для помощи

Если проблема не решена:
1. Сохраните логи: `docker compose logs backend > backend-logs.txt`
2. Проверьте конфигурацию: `cat backend/.env`
3. Проверьте статус контейнеров: `docker compose ps`

---

**Обновлено:** Добавлена улучшенная обработка ошибок в `Login.tsx` и `auth.controller.ts` для более детальной диагностики.

