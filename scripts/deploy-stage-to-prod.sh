#!/bin/bash
# Скрипт для развертывания кода из stage на production
# Использование: ./scripts/deploy-stage-to-prod.sh
# 
# ВАЖНО: Этот скрипт обновит код на продакшн сервере!
# Убедитесь что вы готовы к развертыванию.

set -e

PROD_SERVER="178.72.139.236"
PROD_USER="root"
STAGE_SERVER="178.72.152.120"
STAGE_USER="root"
PROJECT_DIR="/var/www/app"
REPO_URL="https://github.com/AlexandrGusew/Elbrus-Arena.git"
BRANCH="dpl"

echo "🚀 Развертывание кода из stage на production"
echo "=============================================="
echo ""
echo "📍 Stage сервер: $STAGE_SERVER"
echo "📍 Production сервер: $PROD_SERVER"
echo "📍 Ветка: $BRANCH"
echo ""
echo "⚠️  ВНИМАНИЕ: Этот скрипт обновит код на продакшн сервере!"
read -p "Продолжить? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Развертывание отменено"
    exit 1
fi

# Функции для выполнения команд
prod_exec() {
    ssh "$PROD_USER@$PROD_SERVER" "$1"
}

stage_exec() {
    ssh "$STAGE_USER@$STAGE_SERVER" "$1"
}

# Шаг 1: Проверка текущего состояния на stage
echo ""
echo "🔍 Проверка состояния на stage сервере..."
STAGE_COMMIT=$(stage_exec "cd $PROJECT_DIR && git rev-parse HEAD 2>/dev/null || echo 'не git'")
STAGE_BRANCH=$(stage_exec "cd $PROJECT_DIR && git branch --show-current 2>/dev/null || echo 'неизвестно'")
echo "📍 Stage: ветка $STAGE_BRANCH, коммит ${STAGE_COMMIT:0:7}"

# Шаг 2: Проверка текущего состояния на prod
echo ""
echo "🔍 Проверка состояния на production сервере..."
PROD_COMMIT=$(prod_exec "cd $PROJECT_DIR && git rev-parse HEAD 2>/dev/null || echo 'не git'")
PROD_BRANCH=$(prod_exec "cd $PROJECT_DIR && git branch --show-current 2>/dev/null || echo 'неизвестно'")
echo "📍 Production: ветка $PROD_BRANCH, коммит ${PROD_COMMIT:0:7}"

if [ "$STAGE_COMMIT" = "$PROD_COMMIT" ] && [ "$STAGE_COMMIT" != "не git" ]; then
    echo "⚠️  Код на stage и prod уже идентичен!"
    read -p "Все равно продолжить? (yes/no): " force_continue
    if [ "$force_continue" != "yes" ]; then
        echo "❌ Развертывание отменено"
        exit 1
    fi
fi

# Шаг 3: Резервное копирование .env файлов на prod
echo ""
echo "💾 Резервное копирование .env файлов на production..."
prod_exec "cd $PROJECT_DIR && \
    [ -f .env ] && cp .env .env.backup.$(date +%Y%m%d_%H%M%S) || echo 'Root .env не найден' && \
    [ -f backend/.env ] && cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S) || echo 'Backend .env не найден'"
echo "✅ Резервные копии созданы"

# Шаг 4: Обновление кода на production из репозитория
echo ""
echo "📥 Обновление кода на production из репозитория..."
if prod_exec "[ -d $PROJECT_DIR/.git ]"; then
    echo "🔄 Обновление существующего репозитория..."
    prod_exec "cd $PROJECT_DIR && \
        git fetch origin && \
        git stash && \
        git checkout $BRANCH && \
        git pull origin $BRANCH"
else
    echo "❌ Git репозиторий не найден на production сервере!"
    echo "💡 Сначала настройте проект на production сервере"
    exit 1
fi

NEW_COMMIT=$(prod_exec "cd $PROJECT_DIR && git rev-parse HEAD")
echo "✅ Код обновлен до коммита ${NEW_COMMIT:0:7}"

# Шаг 5: Восстановление .env файлов (если были изменены)
echo ""
echo "🔧 Проверка .env файлов..."
# .env файлы должны остаться без изменений, но проверим
if ! prod_exec "[ -f $PROJECT_DIR/.env ]"; then
    echo "⚠️  Root .env не найден после обновления!"
    echo "💡 Восстановите из резервной копии или создайте вручную"
fi

if ! prod_exec "[ -f $PROJECT_DIR/backend/.env ]"; then
    echo "⚠️  Backend .env не найден после обновления!"
    echo "💡 Восстановите из резервной копии или создайте вручную"
fi

# Шаг 6: Применение миграций базы данных
echo ""
echo "🗄️  Применение миграций базы данных..."
prod_exec "cd $PROJECT_DIR && docker compose run --rm backend npx prisma migrate deploy" || echo "⚠️  Ошибка при применении миграций"

# Шаг 7: Сборка Docker образов
echo ""
echo "🔨 Сборка Docker образов на production..."
prod_exec "cd $PROJECT_DIR && docker compose build --no-cache"

# Шаг 8: Перезапуск контейнеров
echo ""
echo "🔄 Перезапуск контейнеров на production..."
prod_exec "cd $PROJECT_DIR && docker compose down && docker compose up -d"

# Шаг 9: Ожидание запуска
echo ""
echo "⏳ Ожидание запуска сервисов (30 секунд)..."
sleep 30

# Шаг 10: Проверка статуса
echo ""
echo "✅ Проверка статуса контейнеров..."
prod_exec "cd $PROJECT_DIR && docker compose ps"

# Шаг 11: Проверка здоровья сервисов
echo ""
echo "🏥 Проверка здоровья сервисов..."
sleep 10

# Проверка backend
BACKEND_STATUS=$(prod_exec "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api || echo '000'")
if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "404" ]; then
    echo "✅ Backend отвечает (HTTP $BACKEND_STATUS)"
else
    echo "⚠️  Backend может быть недоступен (HTTP $BACKEND_STATUS)"
fi

# Проверка frontend
FRONTEND_STATUS=$(prod_exec "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 || echo '000'")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend отвечает (HTTP $FRONTEND_STATUS)"
else
    echo "⚠️  Frontend может быть недоступен (HTTP $FRONTEND_STATUS)"
fi

echo ""
echo "=============================================="
echo "✨ Развертывание завершено!"
echo ""
echo "📊 Сводка:"
echo "   Stage:   ${STAGE_COMMIT:0:7} ($STAGE_BRANCH)"
echo "   Production: ${NEW_COMMIT:0:7} ($BRANCH)"
echo ""
echo "🌐 Production доступен по адресу: https://nightfall-arena.ru"
echo ""
echo "📋 Полезные команды:"
echo "   Просмотр логов: ssh $PROD_USER@$PROD_SERVER 'cd $PROJECT_DIR && docker compose logs -f'"
echo "   Перезапуск: ssh $PROD_USER@$PROD_SERVER 'cd $PROJECT_DIR && docker compose restart'"
echo "   Статус: ssh $PROD_USER@$PROD_SERVER 'cd $PROJECT_DIR && docker compose ps'"
echo "   Откат: ssh $PROD_USER@$PROD_SERVER 'cd $PROJECT_DIR && git checkout $PROD_COMMIT && docker compose build && docker compose up -d'"
echo ""
echo "⚠️  Если что-то пошло не так, используйте команду отката выше"


