#!/bin/bash
# Правильная установка Docker и Docker Compose

set -e

echo "🐳 Установка Docker..."

# Установка Docker через официальный скрипт
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Проверка Docker
docker --version

echo ""
echo "🐳 Установка Docker Compose..."

# Установка Docker Compose plugin
apt update
apt install -y docker-compose-plugin

# Проверка Docker Compose
docker compose version

echo ""
echo "✅ Docker и Docker Compose установлены!"

