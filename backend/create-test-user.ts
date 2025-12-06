import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('test123', 10);

  // Создаем пользователя
  const user = await prisma.user.upsert({
    where: { username: 'player1' },
    update: {},
    create: {
      username: 'player1',
      password: hashedPassword,
      firstName: 'Игрок 1',
    },
  });

  console.log('✅ Пользователь создан:', user);

  // Создаем персонажа
  const character = await prisma.character.upsert({
    where: { name: 'TestHero' },
    update: {},
    create: {
      userId: user.id,
      name: 'TestHero',
      class: 'WARRIOR',
      level: 1,
      experience: 0,
      strength: 10,
      agility: 5,
      intelligence: 5,
      freePoints: 5,
      maxHp: 120,
      currentHp: 120,
      armor: 15,
      gold: 500,
      stamina: 100,
    },
  });

  console.log('✅ Персонаж создан:', character);

  // Создаем инвентарь
  const inventory = await prisma.inventory.upsert({
    where: { characterId: character.id },
    update: {},
    create: {
      characterId: character.id,
      size: 40,
    },
  });

  console.log('✅ Инвентарь создан');

  console.log('\n🎮 Данные для входа:');
  console.log('Логин: player1');
  console.log('Пароль: test123');
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
