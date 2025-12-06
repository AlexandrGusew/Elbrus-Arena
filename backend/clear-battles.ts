import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearBattles() {
  try {
    // Удаляем все старые бои
    const deleted = await prisma.pveBattle.deleteMany({});
    console.log(`✅ Удалено ${deleted.count} старых боёв`);

    console.log('✅ База данных очищена! Можно начинать новый бой.');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearBattles();
