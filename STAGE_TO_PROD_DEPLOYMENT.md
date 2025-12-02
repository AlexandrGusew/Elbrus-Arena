# Развертывание кода из Stage на Production

## Обзор

Этот процесс позволяет развернуть код, протестированный на stage сервере, на production сервер.

**Важно:**
- Код берется из Git репозитория (ветка `dpl`)
- .env файлы на production сохраняются (не перезаписываются)
- Выполняется резервное копирование перед обновлением
- Применяются миграции базы данных
- Контейнеры пересобираются и перезапускаются

## Предварительные требования

1. SSH доступ к обоим серверам:
   - Stage: `178.72.152.120`
   - Production: `178.72.139.236`
2. Код должен быть закоммичен и запушен в репозиторий (ветка `dpl`)
3. Код должен быть протестирован на stage сервере

## Автоматическое развертывание

### Вариант 1: Использование скрипта (рекомендуется)

```bash
# Сделайте скрипт исполняемым
chmod +x scripts/deploy-stage-to-prod.sh

# Запустите развертывание
./scripts/deploy-stage-to-prod.sh
```

Скрипт автоматически:
1. ✅ Проверит текущее состояние на stage и prod
2. ✅ Создаст резервные копии .env файлов
3. ✅ Обновит код из репозитория
4. ✅ Применит миграции БД
5. ✅ Пересоберет Docker образы
6. ✅ Перезапустит контейнеры
7. ✅ Проверит статус сервисов

### Вариант 2: Ручное развертывание

#### Шаг 1: Убедитесь что код закоммичен и запушен

```bash
# На локальной машине или stage сервере
git status
git add .
git commit -m "Описание изменений"
git push origin dpl
```

#### Шаг 2: Подключитесь к production серверу

```bash
ssh root@178.72.139.236
```

#### Шаг 3: Резервное копирование

```bash
cd /var/www/app

# Создайте резервные копии .env файлов
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)

# Опционально: создайте резервную копию всего проекта
tar -czf /tmp/app-backup-$(date +%Y%m%d_%H%M%S).tar.gz .
```

#### Шаг 4: Обновление кода

```bash
cd /var/www/app

# Получите последние изменения
git fetch origin

# Сохраните текущий коммит (на случай отката)
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "Текущий коммит: $CURRENT_COMMIT"

# Переключитесь на нужную ветку и обновите
git stash  # Сохраните локальные изменения если есть
git checkout dpl
git pull origin dpl

# Проверьте что обновление прошло успешно
git log --oneline -5
```

#### Шаг 5: Применение миграций

```bash
cd /var/www/app

# Примените миграции базы данных
docker compose run --rm backend npx prisma migrate deploy
```

#### Шаг 6: Пересборка и перезапуск

```bash
cd /var/www/app

# Остановите контейнеры
docker compose down

# Пересоберите образы
docker compose build --no-cache

# Запустите контейнеры
docker compose up -d

# Проверьте статус
docker compose ps
```

#### Шаг 7: Проверка работоспособности

```bash
# Проверьте логи
docker compose logs -f

# Проверьте доступность API
curl http://localhost:3000/api

# Проверьте доступность frontend
curl http://localhost:8080

# Проверьте в браузере
# https://nightfall-arena.ru
```

## Откат изменений (Rollback)

Если что-то пошло не так, можно откатить изменения:

```bash
ssh root@178.72.139.236
cd /var/www/app

# Найдите коммит для отката (из резервной копии или истории)
git log --oneline -10

# Откатитесь к предыдущему коммиту
git checkout <предыдущий_коммит>

# Восстановите .env файлы из резервной копии
cp .env.backup.* .env
cp backend/.env.backup.* backend/.env

# Пересоберите и перезапустите
docker compose build --no-cache
docker compose up -d
```

## Проверка перед развертыванием

Перед развертыванием на production убедитесь:

- [ ] Код протестирован на stage сервере
- [ ] Все изменения закоммичены и запушены в репозиторий
- [ ] Миграции базы данных протестированы
- [ ] Нет критических ошибок в логах stage
- [ ] Создана резервная копия production данных
- [ ] Выбран подходящий момент (низкая нагрузка)

## Мониторинг после развертывания

После развертывания следите за:

1. **Логи контейнеров:**
   ```bash
   ssh root@178.72.139.236 'cd /var/www/app && docker compose logs -f'
   ```

2. **Статус контейнеров:**
   ```bash
   ssh root@178.72.139.236 'cd /var/www/app && docker compose ps'
   ```

3. **Доступность сервисов:**
   - https://nightfall-arena.ru
   - https://nightfall-arena.ru/api

4. **Ошибки в логах Nginx:**
   ```bash
   ssh root@178.72.139.236 'tail -f /var/log/nginx/*.log'
   ```

## Частые проблемы

### Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker compose logs backend
docker compose logs frontend

# Проверьте .env файлы
cat .env
cat backend/.env

# Проверьте docker-compose.yml
docker compose config
```

### Проблема: Ошибки миграций

```bash
# Проверьте статус миграций
docker compose run --rm backend npx prisma migrate status

# При необходимости откатите миграции
docker compose run --rm backend npx prisma migrate resolve --rolled-back <migration_name>
```

### Проблема: Старый код все еще работает

```bash
# Убедитесь что контейнеры пересобраны
docker compose build --no-cache

# Полностью перезапустите
docker compose down
docker compose up -d

# Проверьте что используется правильный образ
docker compose images
```

## Безопасность

⚠️ **Важные замечания:**

- Никогда не коммитьте .env файлы в репозиторий
- Всегда создавайте резервные копии перед развертыванием
- Тестируйте изменения на stage перед production
- Используйте теги версий для важных развертываний
- Ведите журнал развертываний

---

**Готово!** После успешного развертывания production будет обновлен кодом из stage.


