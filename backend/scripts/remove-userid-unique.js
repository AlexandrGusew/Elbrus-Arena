const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Удаление unique constraint с userId...');
  
  try {
    // Удаляем unique constraint/index если существует
    await prisma.$executeRaw`
      DROP INDEX IF EXISTS "characters_userId_key";
    `;
    
    console.log('✓ Unique constraint удален');
    
    // Создаем обычный индекс на userId если его еще нет
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "characters_userId_idx" ON "characters"("userId");
    `;
    
    console.log('✓ Индекс на userId создан');
    
    console.log('Миграция выполнена успешно!');
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

