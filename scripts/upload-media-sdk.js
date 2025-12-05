#!/usr/bin/env node

/**
 * Скрипт для загрузки медиафайлов в MinIO через SDK
 */

const fs = require('fs');
const path = require('path');
const Minio = require('minio');

const config = {
  endPoint: '178.72.139.236',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  bucket: 'elbrus-arena-assets',
  assetsDir: path.resolve(__dirname, '../frontend/src/assets'),
};

const minioClient = new Minio.Client({
  endPoint: config.endPoint,
  port: config.port,
  useSSL: config.useSSL,
  accessKey: config.accessKey,
  secretKey: config.secretKey,
});

// Рекурсивный поиск всех медиа-файлов
function findMediaFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMediaFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.mp4', '.mp3', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Получение размера файла
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Загрузка файла
async function uploadFile(localPath) {
  const relativePath = path.relative(config.assetsDir, localPath).replace(/\\/g, '/');
  const fileSize = fs.statSync(localPath).size;

  try {
    await minioClient.fPutObject(config.bucket, relativePath, localPath, {
      'Content-Type': getContentType(path.extname(localPath)),
    });
    console.log(`✅ Загружено: ${relativePath} (${formatBytes(fileSize)})`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при загрузке ${relativePath}:`, error.message);
    return false;
  }
}

// Определение Content-Type
function getContentType(ext) {
  const types = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

// Проверка bucket
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(config.bucket);
    if (!exists) {
      console.log(`⚠️  Bucket "${config.bucket}" не найден, создаю...`);
      await minioClient.makeBucket(config.bucket);
      console.log(`✅ Bucket "${config.bucket}" создан`);

      // Установить публичный доступ
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${config.bucket}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(config.bucket, JSON.stringify(policy));
      console.log('✅ Публичный доступ настроен');
    } else {
      console.log(`✅ Bucket "${config.bucket}" существует`);
    }
    return true;
  } catch (error) {
    console.error('❌ Ошибка при проверке bucket:', error.message);
    return false;
  }
}

// Главная функция
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Загрузка медиа-файлов в MinIO');
  console.log('='.repeat(60) + '\n');

  console.log('Конфигурация:');
  console.log(`  EndPoint: ${config.endPoint}:${config.port}`);
  console.log(`  Bucket: ${config.bucket}`);
  console.log(`  Assets Dir: ${config.assetsDir}\n`);

  // Проверка bucket
  if (!(await ensureBucket())) {
    process.exit(1);
  }

  // Поиск файлов
  console.log(`ℹ️  Ищу медиа-файлы в: ${config.assetsDir}`);

  if (!fs.existsSync(config.assetsDir)) {
    console.error(`❌ Директория не найдена: ${config.assetsDir}`);
    process.exit(1);
  }

  const mediaFiles = findMediaFiles(config.assetsDir);

  if (mediaFiles.length === 0) {
    console.log('⚠️  Медиа-файлы не найдены');
    process.exit(0);
  }

  console.log(`✅ Найдено файлов: ${mediaFiles.length}`);

  const totalSize = mediaFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  console.log(`ℹ️  Общий размер: ${formatBytes(totalSize)}\n`);

  // Загрузка файлов
  let uploaded = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const file of mediaFiles) {
    if (await uploadFile(file)) {
      uploaded++;
    } else {
      failed++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('📊 Статистика');
  console.log('='.repeat(60));
  console.log(`✅ Загружено: ${uploaded} файлов`);
  if (failed > 0) {
    console.log(`❌ Ошибок: ${failed}`);
  }
  console.log(`ℹ️  Время: ${elapsed}s`);
  console.log(`ℹ️  Размер: ${formatBytes(totalSize)}\n`);

  console.log('='.repeat(60));
  console.log('✨ Готово!');
  console.log('='.repeat(60) + '\n');
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error.message);
  process.exit(1);
});
