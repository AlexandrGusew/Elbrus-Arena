#!/bin/bash

# Скрипт для быстрого исправления CORS на MinIO

echo "=== Fixing MinIO CORS ==="

# Установка MinIO Client если нет
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO Client..."
    wget https://dl.min.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    sudo mv mc /usr/local/bin/
fi

# Настройка алиаса (замени на свои данные)
echo "Configuring MinIO alias..."
mc alias set myminio https://nightfall-arena.ru/minio minioadmin minioadminpassword

# Применение CORS конфигурации
echo "Applying CORS configuration..."
cat > /tmp/minio-cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://stage.nightfall-arena.ru",
        "https://nightfall-arena.ru",
        "http://localhost:5173",
        "http://localhost:3000"
      ],
      "AllowedMethods": [
        "GET",
        "HEAD"
      ],
      "AllowedHeaders": [
        "*"
      ],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

# Применяем конфигурацию
mc admin config set myminio api cors_allow_origin="https://stage.nightfall-arena.ru,https://nightfall-arena.ru"

# Перезапускаем MinIO
docker restart minio

echo "=== CORS configuration applied! ==="
