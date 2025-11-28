#!/usr/bin/env node

/**
 * Скрипт для загрузки всех медиа-файлов из frontend/src/assets в MinIO
 *
 * Использование:
 * 1. Установить MinIO Client (mc): https://min.io/docs/minio/linux/reference/minio-mc.html
 * 2. Настроить подключение: mc alias set myminio http://localhost:9000 ACCESS_KEY SECRET_KEY
 * 3. Запустить скрипт: node scripts/upload-assets-to-minio.js
 *
 * Или использовать с аргументами:
 * node scripts/upload-assets-to-minio.js --host http://localhost:9000 --bucket elbrus-arena-assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Конфигурация из аргументов командной строки или defaults
const args = process.argv.slice(2);
const config = {
  host: getArg('--host') || 'http://localhost:9000',
  bucket: getArg('--bucket') || 'elbrus-arena-assets',
  alias: getArg('--alias') || 'myminio',
  assetsDir: path.resolve(__dirname, '../frontend/src/assets'),
  dryRun: hasArg('--dry-run'),
  verbose: hasArg('--verbose'),
};

function getArg(name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function hasArg(name) {
  return args.includes(name);
}

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Проверка наличия mc (MinIO Client)
function checkMinioClient() {
  try {
    execSync('mc --version', { stdio: 'ignore' });
    logSuccess('MinIO Client (mc) установлен');
    return true;
  } catch (error) {
    logError('MinIO Client (mc) не найден');
    logInfo('Установите mc: https://min.io/docs/minio/linux/reference/minio-mc.html');
    logInfo('Linux: wget https://dl.min.io/client/mc/release/linux-amd64/mc');
    return false;
  }
}

// Проверка подключения к MinIO
function checkMinioConnection() {
  try {
    const output = execSync(`mc alias list ${config.alias}`, {
      encoding: 'utf-8',
    });
    if (output.includes(config.alias)) {
      logSuccess(`Подключение к MinIO alias "${config.alias}" OK`);
      return true;
    }
  } catch (error) {
    logError(`Не удалось подключиться к MinIO alias "${config.alias}"`);
    logInfo(`Настройте подключение:`);
    logInfo(
      `  mc alias set ${config.alias} ${config.host} YOUR_ACCESS_KEY YOUR_SECRET_KEY`
    );
    return false;
  }
  return false;
}

// Создание bucket если не существует
function ensureBucket() {
  try {
    const buckets = execSync(`mc ls ${config.alias}`, { encoding: 'utf-8' });

    if (buckets.includes(config.bucket)) {
      logSuccess(`Bucket "${config.bucket}" существует`);
      return true;
    }

    logWarning(`Bucket "${config.bucket}" не найден, создаю...`);
    execSync(`mc mb ${config.alias}/${config.bucket}`);
    logSuccess(`Bucket "${config.bucket}" создан`);

    // Настроить публичный доступ для чтения
    logInfo('Настраиваю публичный доступ для чтения...');
    execSync(`mc anonymous set download ${config.alias}/${config.bucket}`);
    logSuccess('Публичный доступ настроен');

    return true;
  } catch (error) {
    logError(`Ошибка при создании bucket: ${error.message}`);
    return false;
  }
}

// Рекурсивный поиск всех медиа-файлов
function findMediaFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMediaFiles(filePath, fileList);
    } else {
      // Фильтруем только медиа-файлы
      const ext = path.extname(file).toLowerCase();
      if (
        ['.mp4', '.mp3', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)
      ) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Получение размера файла в человекочитаемом формате
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Загрузка файла в MinIO
function uploadFile(localPath) {
  const relativePath = path.relative(config.assetsDir, localPath);
  const remotePath = `${config.alias}/${config.bucket}/${relativePath.replace(/\\/g, '/')}`;

  const fileSize = fs.statSync(localPath).size;
  const fileSizeStr = formatBytes(fileSize);

  if (config.dryRun) {
    logInfo(`[DRY RUN] ${relativePath} (${fileSizeStr}) -> ${remotePath}`);
    return true;
  }

  try {
    if (config.verbose) {
      logInfo(`Загружаю: ${relativePath} (${fileSizeStr})`);
    }

    execSync(`mc cp "${localPath}" "${remotePath}"`, {
      stdio: config.verbose ? 'inherit' : 'ignore',
    });

    return true;
  } catch (error) {
    logError(`Ошибка при загрузке ${relativePath}: ${error.message}`);
    return false;
  }
}

// Настройка CORS для bucket
function configureCORS() {
  logInfo('Настраиваю CORS для bucket...');

  const corsConfig = {
    CORSRules: [
      {
        AllowedOrigins: [
          'https://nightfall-arena.ru',
          'http://localhost:5173',
          'http://localhost:3000',
        ],
        AllowedMethods: ['GET', 'HEAD'],
        AllowedHeaders: ['*'],
        MaxAgeSeconds: 3600,
      },
    ],
  };

  const corsFile = path.resolve(__dirname, '../minio-cors.json');

  try {
    fs.writeFileSync(corsFile, JSON.stringify(corsConfig, null, 2));
    execSync(`mc anonymous set-json ${corsFile} ${config.alias}/${config.bucket}`);
    fs.unlinkSync(corsFile);
    logSuccess('CORS настроен');
  } catch (error) {
    logWarning(`Не удалось настроить CORS: ${error.message}`);
    logInfo('Настройте CORS вручную или через nginx');
  }
}

// Главная функция
async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('🚀 Загрузка медиа-файлов в MinIO', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  logInfo('Конфигурация:');
  console.log(JSON.stringify(config, null, 2));
  console.log();

  // Проверки
  if (!checkMinioClient()) {
    process.exit(1);
  }

  if (!checkMinioConnection()) {
    process.exit(1);
  }

  if (!ensureBucket()) {
    process.exit(1);
  }

  // Поиск файлов
  logInfo(`Ищу медиа-файлы в: ${config.assetsDir}`);

  if (!fs.existsSync(config.assetsDir)) {
    logError(`Директория не найдена: ${config.assetsDir}`);
    process.exit(1);
  }

  const mediaFiles = findMediaFiles(config.assetsDir);

  if (mediaFiles.length === 0) {
    logWarning('Медиа-файлы не найдены');
    process.exit(0);
  }

  logSuccess(`Найдено файлов: ${mediaFiles.length}`);

  // Подсчет общего размера
  const totalSize = mediaFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  logInfo(`Общий размер: ${formatBytes(totalSize)}`);
  console.log();

  if (config.dryRun) {
    logWarning('РЕЖИМ ТЕСТИРОВАНИЯ (--dry-run) - файлы не будут загружены');
    console.log();
  }

  // Загрузка файлов
  let uploaded = 0;
  let failed = 0;

  const startTime = Date.now();

  for (let i = 0; i < mediaFiles.length; i++) {
    const file = mediaFiles[i];
    const progress = `[${i + 1}/${mediaFiles.length}]`;

    if (!config.verbose) {
      process.stdout.write(`\r${progress} Загрузка файлов...`);
    }

    if (uploadFile(file)) {
      uploaded++;
    } else {
      failed++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n');
  log('='.repeat(60), colors.bright);
  log('📊 Статистика', colors.bright);
  log('='.repeat(60), colors.bright);
  logSuccess(`Загружено: ${uploaded} файлов`);
  if (failed > 0) {
    logError(`Ошибок: ${failed}`);
  }
  logInfo(`Время: ${elapsed}s`);
  logInfo(`Размер: ${formatBytes(totalSize)}`);
  console.log();

  if (!config.dryRun) {
    // Настройка CORS
    configureCORS();

    // Итоговые инструкции
    log('='.repeat(60), colors.bright);
    log('✨ Готово!', colors.green + colors.bright);
    log('='.repeat(60), colors.bright);
    console.log();
    logInfo('Следующие шаги:');
    console.log();
    console.log('  1. Проверьте загруженные файлы:');
    console.log(`     mc ls ${config.alias}/${config.bucket}/`);
    console.log();
    console.log('  2. Обновите .env файл:');
    console.log(`     VITE_MINIO_URL=${config.host}`);
    console.log(`     VITE_MINIO_BUCKET=${config.bucket}`);
    console.log(`     VITE_USE_MINIO=true`);
    console.log();
    console.log('  3. Обновите импорты в коде (см. MINIO_MIGRATION.md)');
    console.log();
    console.log('  4. Настройте nginx для проксирования MinIO (см. MINIO_MIGRATION.md)');
    console.log();
    console.log('  5. Пересоберите Docker образ с исключением assets');
    console.log();
  }
}

// Запуск
main().catch((error) => {
  logError(`Критическая ошибка: ${error.message}`);
  process.exit(1);
});
