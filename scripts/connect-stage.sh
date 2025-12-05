#!/bin/bash
# Скрипт для подключения к stage серверу с автоматическим принятием ключа
# Использование: ./scripts/connect-stage.sh

STAGE_SERVER="178.72.152.120"
STAGE_USER="root"

echo "🔌 Подключение к stage серверу $STAGE_SERVER..."

# Добавляем хост в known_hosts автоматически (только для первого подключения)
ssh-keyscan -H $STAGE_SERVER >> ~/.ssh/known_hosts 2>/dev/null

# Подключаемся
ssh -o StrictHostKeyChecking=accept-new $STAGE_USER@$STAGE_SERVER

