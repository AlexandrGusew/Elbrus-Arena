# Инструкция по работе с MinIO

## Данные для подключения

- **Веб-интерфейс:** http://178.72.139.236:9001
- **API:** http://178.72.139.236:9000
- **Логин:** minioadmin
- **Пароль:** minioadmin
- **Bucket:** elbrus-arena-assets

---

## 1. Подключение через MinIO Client (mc)

### Установка mc (если не установлен)

**Linux:**
```bash
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

**Windows:**
Скачать: https://dl.min.io/client/mc/release/windows-amd64/mc.exe

### Настройка подключения

```bash
mc alias set myminio http://178.72.139.236:9000 minioadmin minioadmin
```

### Проверка подключения

```bash
mc admin info myminio
```

---

## 2. Загрузка файлов

### Способ 1: Автоматическая загрузка всех файлов

```bash
cd "D:\elbrus-part-time\Бобры\Фаза 3\Выпускной проект\Финальный проект"
node scripts/upload-assets-to-minio.js --host http://178.72.139.236:9000 --bucket elbrus-arena-assets --alias myminio
```

### Способ 2: Загрузка через mc (командная строка)

**Один файл:**
```bash
mc cp frontend/src/assets/choosePlayer/warrior.png myminio/elbrus-arena-assets/choosePlayer/warrior.png
```

**Вся папка:**
```bash
mc cp --recursive frontend/src/assets/choosePlayer/ myminio/elbrus-arena-assets/choosePlayer/
```

**Все assets:**
```bash
mc cp --recursive frontend/src/assets/ myminio/elbrus-arena-assets/
```

### Способ 3: Загрузка через веб-интерфейс

1. Откройте: http://178.72.139.236:9001
2. Войдите: minioadmin / minioadmin
3. Выберите bucket: elbrus-arena-assets
4. Нажмите "Upload" → выберите файлы
5. Перетащите файлы в нужную папку

---

## 3. Просмотр файлов

### Через командную строку

```bash
# Список файлов в корне
mc ls myminio/elbrus-arena-assets/

# Список всех файлов рекурсивно
mc ls -r myminio/elbrus-arena-assets/

# Список файлов в папке
mc ls myminio/elbrus-arena-assets/choosePlayer/

# Размер bucket
mc du myminio/elbrus-arena-assets/
```

### Через веб-интерфейс

1. Откройте: http://178.72.139.236:9001/browser/elbrus-arena-assets
2. Просматривайте файлы и папки

---

## 4. Удаление файлов

```bash
# Удалить один файл
mc rm myminio/elbrus-arena-assets/choosePlayer/warrior.png

# Удалить всю папку
mc rm --recursive --force myminio/elbrus-arena-assets/choosePlayer/

# Удалить все файлы в bucket (осторожно!)
mc rm --recursive --force myminio/elbrus-arena-assets/
```

---

## 5. Обновление файла

```bash
# Загрузить новый файл с тем же именем (заменит старый)
mc cp new-warrior.png myminio/elbrus-arena-assets/choosePlayer/warrior.png
```

---

## 6. Скачивание файлов

```bash
# Скачать один файл
mc cp myminio/elbrus-arena-assets/choosePlayer/warrior.png ./warrior.png

# Скачать папку
mc cp --recursive myminio/elbrus-arena-assets/choosePlayer/ ./downloaded/
```

---

## 7. Настройка публичного доступа

```bash
# Установить публичный доступ для чтения
mc anonymous set download myminio/elbrus-arena-assets
```

---

## 8. Проверка доступности файла

```bash
# Проверить через API
curl -I http://178.72.139.236:9000/elbrus-arena-assets/choosePlayer/warrior.png
```

---

## 9. Использование в коде

### В React компонентах

```typescript
import { getAssetUrl } from '@/utils/assetUrl';

// Изображение
<img src={getAssetUrl('choosePlayer/warrior.png')} alt="Warrior" />

// Видео
<video autoPlay loop muted>
  <source src={getAssetUrl('choosePlayer/animatedBackground.mp4')} type="video/mp4" />
</video>

// Аудио
<audio autoPlay loop>
  <source src={getAssetUrl('choosePlayer/backgroundIntro2.mp3')} type="audio/mp3" />
</audio>
```

---

## 10. Настройка переменных окружения

В файле `.env` или `.env.production`:

```env
VITE_MINIO_URL=http://178.72.139.236:9000
VITE_MINIO_BUCKET=elbrus-arena-assets
VITE_USE_MINIO=true
```

После изменения пересобрать:
```bash
docker compose build --no-cache frontend
docker compose up -d
```

---

## 11. Типичные задачи

### Загрузить новый файл

```bash
# 1. Загрузить
mc cp file.png myminio/elbrus-arena-assets/path/to/file.png

# 2. Проверить
mc ls myminio/elbrus-arena-assets/path/to/

# 3. Использовать в коде
# getAssetUrl('path/to/file.png')
```

### Обновить существующий файл

```bash
# 1. Загрузить новый файл с тем же именем
mc cp new-file.png myminio/elbrus-arena-assets/path/to/file.png

# 2. Проверить
curl -I http://178.72.139.236:9000/elbrus-arena-assets/path/to/file.png
```

### Загрузить все новые файлы из папки

```bash
mc cp --recursive frontend/src/assets/ myminio/elbrus-arena-assets/
```

### Синхронизировать локальную папку с MinIO

```bash
mc mirror --overwrite frontend/src/assets/ myminio/elbrus-arena-assets/
```

---

## 12. Решение проблем

### Ошибка "Access Denied"

```bash
mc anonymous set download myminio/elbrus-arena-assets
```

### Файл не отображается на сайте

```bash
# 1. Проверить что файл загружен
mc ls myminio/elbrus-arena-assets/path/to/file.png

# 2. Проверить доступность
curl -I http://178.72.139.236:9000/elbrus-arena-assets/path/to/file.png

# 3. Проверить переменные окружения
echo $VITE_MINIO_URL
echo $VITE_MINIO_BUCKET
```

### CORS ошибки

```bash
# Создать файл cors.json
cat > cors.json <<EOF
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

# Применить
mc anonymous set-json cors.json myminio/elbrus-arena-assets
```

---

## 13. Быстрые команды

```bash
# Подключение
mc alias set myminio http://178.72.139.236:9000 minioadmin minioadmin

# Загрузить все assets
node scripts/upload-assets-to-minio.js --host http://178.72.139.236:9000 --bucket elbrus-arena-assets --alias myminio

# Просмотр файлов
mc ls -r myminio/elbrus-arena-assets/

# Размер bucket
mc du myminio/elbrus-arena-assets/

# Публичный доступ
mc anonymous set download myminio/elbrus-arena-assets
```
