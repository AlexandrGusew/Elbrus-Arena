import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  await prisma.user.createMany({
    data: [
      {
        telegramId: BigInt(123456789),
        username: 'testuser1',
        firstName: 'Тестовый Пользователь 1',
      },
      {
        telegramId: BigInt(987654321),
        username: 'testuser2',
        firstName: 'Тестовый Пользователь 2',
      },
      {
        telegramId: BigInt(555555555),
        username: 'testuser3',
        firstName: 'Тестовый Пользователь 3',
      },
    ],
  });

  const rat = await prisma.monster.create({
    data: {
      name: 'Крыса',
      hp: 50,
      damage: 5,
      armor: 0,
      isBoss: false,
    },
  });

  const goblin = await prisma.monster.create({
    data: {
      name: 'Гоблин',
      hp: 70,
      damage: 8,
      armor: 3,
      isBoss: false,
    },
  });

  const skeleton = await prisma.monster.create({
    data: {
      name: 'Скелет',
      hp: 90,
      damage: 10,
      armor: 5,
      isBoss: false,
    },
  });

  const orc = await prisma.monster.create({
    data: {
      name: 'Орк',
      hp: 110,
      damage: 12,
      armor: 8,
      isBoss: false,
    },
  });

  const demon = await prisma.monster.create({
    data: {
      name: 'Демон',
      hp: 250,
      damage: 25,
      armor: 15,
      isBoss: true,
    },
  });

  await prisma.item.createMany({
    data: [
      // Оружие
      {
        name: 'Ржавый меч',
        type: 'weapon',
        damage: 5,
        price: 10,
        minStrength: 0,
        minLevel: 1,
      },
      {
        name: 'Стальной меч',
        type: 'weapon',
        damage: 10,
        price: 50,
        minStrength: 10,
        minLevel: 3,
      },
      {
        name: 'Меч героя',
        type: 'weapon',
        damage: 20,
        price: 200,
        minStrength: 20,
        minLevel: 10,
      },
      // Броня
      {
        name: 'Кожанка',
        type: 'armor',
        armor: 5,
        price: 15,
        minStrength: 0,
        minLevel: 1,
      },
      {
        name: 'Кольчуга',
        type: 'armor',
        armor: 10,
        price: 60,
        minStrength: 15,
        minLevel: 5,
      },
      // Шлем
      {
        name: 'Шапка',
        type: 'helmet',
        armor: 2,
        price: 5,
        minLevel: 1,
      },
      {
        name: 'Шлем',
        type: 'helmet',
        armor: 5,
        price: 25,
        minStrength: 10,
        minLevel: 3,
      },
      // Остальное
      {
        name: 'Сапоги',
        type: 'legs',
        armor: 3,
        price: 10,
        minLevel: 1,
      },
      {
        name: 'Пояс',
        type: 'belt',
        armor: 2,
        bonusStr: 1,
        price: 20,
        minStrength: 5,
        minLevel: 2,
      },
      {
        name: 'Зелье HP',
        type: 'potion',
        price: 20,
        minLevel: 1,
      },
    ],
  });

  const easyDungeon = await prisma.dungeon.create({
    data: {
      name: 'Подземелье',
      difficulty: 'easy',
      staminaCost: 20,
      expReward: 50,
      goldReward: 30,
    },
  });

  const mediumDungeon = await prisma.dungeon.create({
    data: {
      name: 'Подземелье',
      difficulty: 'medium',
      staminaCost: 20,
      expReward: 75,
      goldReward: 45,
    },
  });

  const hardDungeon = await prisma.dungeon.create({
    data: {
      name: 'Подземелье',
      difficulty: 'hard',
      staminaCost: 20,
      expReward: 100,
      goldReward: 60,
    },
  });


  // ЛОГИКАЯ СЛЕДУЮЩАЯ Крыса → Гоблин → Крыса → Гоблин → Демон ЭТО ЛЕГКИЙ
  await prisma.dungeonMonster.createMany({
    data: [
      { dungeonId: easyDungeon.id, monsterId: rat.id, position: 1 },
      { dungeonId: easyDungeon.id, monsterId: goblin.id, position: 2 },
      { dungeonId: easyDungeon.id, monsterId: rat.id, position: 3 },
      { dungeonId: easyDungeon.id, monsterId: goblin.id, position: 4 },
      { dungeonId: easyDungeon.id, monsterId: demon.id, position: 5 },
    ],
  });

  // Гоблин → Скелет → Орк → Скелет → Демон СРЕДНИЙ
  await prisma.dungeonMonster.createMany({
    data: [
      { dungeonId: mediumDungeon.id, monsterId: goblin.id, position: 1 },
      { dungeonId: mediumDungeon.id, monsterId: skeleton.id, position: 2 },
      { dungeonId: mediumDungeon.id, monsterId: orc.id, position: 3 },
      { dungeonId: mediumDungeon.id, monsterId: skeleton.id, position: 4 },
      { dungeonId: mediumDungeon.id, monsterId: demon.id, position: 5 },
    ],
  });

  // Скелет → Орк → Орк → Орк → Демон ХАРД УРОВЕНЬ
  await prisma.dungeonMonster.createMany({
    data: [
      { dungeonId: hardDungeon.id, monsterId: skeleton.id, position: 1 },
      { dungeonId: hardDungeon.id, monsterId: orc.id, position: 2 },
      { dungeonId: hardDungeon.id, monsterId: orc.id, position: 3 },
      { dungeonId: hardDungeon.id, monsterId: orc.id, position: 4 },
      { dungeonId: hardDungeon.id, monsterId: demon.id, position: 5 },
    ],
  });

}

main()
  .catch((e) => {
    console.error('Ошибка сидов', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });