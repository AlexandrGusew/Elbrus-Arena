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

  const rustySword = await prisma.item.create({
    data: {
      name: 'Ржавый меч',
      type: 'weapon',
      damage: 5,
      price: 10,
      minStrength: 0,
      minLevel: 1,
    },
  });

  const steelSword = await prisma.item.create({
    data: {
      name: 'Стальной меч',
      type: 'weapon',
      damage: 10,
      price: 50,
      minStrength: 10,
      minLevel: 3,
    },
  });

  const heroSword = await prisma.item.create({
    data: {
      name: 'Меч героя',
      type: 'weapon',
      damage: 20,
      price: 200,
      minStrength: 20,
      minLevel: 10,
    },
  });

  const leatherArmor = await prisma.item.create({
    data: {
      name: 'Кожанка',
      type: 'armor',
      armor: 5,
      price: 15,
      minStrength: 0,
      minLevel: 1,
    },
  });

  const chainmail = await prisma.item.create({
    data: {
      name: 'Кольчуга',
      type: 'armor',
      armor: 10,
      price: 60,
      minStrength: 15,
      minLevel: 5,
    },
  });

  const hat = await prisma.item.create({
    data: {
      name: 'Шапка',
      type: 'helmet',
      armor: 2,
      price: 5,
      minLevel: 1,
    },
  });

  const helmet = await prisma.item.create({
    data: {
      name: 'Шлем',
      type: 'helmet',
      armor: 5,
      price: 25,
      minStrength: 10,
      minLevel: 3,
    },
  });

  const boots = await prisma.item.create({
    data: {
      name: 'Сапоги',
      type: 'legs',
      armor: 3,
      price: 10,
      minLevel: 1,
    },
  });

  const belt = await prisma.item.create({
    data: {
      name: 'Пояс',
      type: 'belt',
      armor: 2,
      bonusStr: 1,
      price: 20,
      minStrength: 5,
      minLevel: 2,
    },
  });

  const potion = await prisma.item.create({
    data: {
      name: 'Зелье HP',
      type: 'potion',
      price: 20,
      minLevel: 1,
    },
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

  // ЛУТОВЫЕ ТАБЛИЦЫ ДЛЯ МОНСТРОВ
  await prisma.monsterLoot.createMany({
    data: [
      // Крыса - дропает зелья и простые вещи
      { monsterId: rat.id, itemId: potion.id, dropChance: 0.3, minCount: 1, maxCount: 1 },
      { monsterId: rat.id, itemId: rustySword.id, dropChance: 0.15, minCount: 1, maxCount: 1 },
      { monsterId: rat.id, itemId: hat.id, dropChance: 0.2, minCount: 1, maxCount: 1 },

      // Гоблин - дропает начальное снаряжение
      { monsterId: goblin.id, itemId: rustySword.id, dropChance: 0.25, minCount: 1, maxCount: 1 },
      { monsterId: goblin.id, itemId: leatherArmor.id, dropChance: 0.2, minCount: 1, maxCount: 1 },
      { monsterId: goblin.id, itemId: boots.id, dropChance: 0.25, minCount: 1, maxCount: 1 },
      { monsterId: goblin.id, itemId: potion.id, dropChance: 0.4, minCount: 1, maxCount: 2 },

      // Скелет - дропает среднее снаряжение
      { monsterId: skeleton.id, itemId: steelSword.id, dropChance: 0.2, minCount: 1, maxCount: 1 },
      { monsterId: skeleton.id, itemId: helmet.id, dropChance: 0.25, minCount: 1, maxCount: 1 },
      { monsterId: skeleton.id, itemId: belt.id, dropChance: 0.3, minCount: 1, maxCount: 1 },
      { monsterId: skeleton.id, itemId: potion.id, dropChance: 0.5, minCount: 1, maxCount: 3 },

      // Орк - дропает хорошее снаряжение
      { monsterId: orc.id, itemId: steelSword.id, dropChance: 0.3, minCount: 1, maxCount: 1 },
      { monsterId: orc.id, itemId: chainmail.id, dropChance: 0.25, minCount: 1, maxCount: 1 },
      { monsterId: orc.id, itemId: helmet.id, dropChance: 0.3, minCount: 1, maxCount: 1 },
      { monsterId: orc.id, itemId: belt.id, dropChance: 0.35, minCount: 1, maxCount: 1 },
      { monsterId: orc.id, itemId: potion.id, dropChance: 0.6, minCount: 2, maxCount: 4 },

      // Демон (босс) - дропает лучшее снаряжение с высоким шансом
      { monsterId: demon.id, itemId: heroSword.id, dropChance: 0.5, minCount: 1, maxCount: 1 },
      { monsterId: demon.id, itemId: chainmail.id, dropChance: 0.7, minCount: 1, maxCount: 1 },
      { monsterId: demon.id, itemId: helmet.id, dropChance: 0.7, minCount: 1, maxCount: 1 },
      { monsterId: demon.id, itemId: belt.id, dropChance: 0.6, minCount: 1, maxCount: 1 },
      { monsterId: demon.id, itemId: potion.id, dropChance: 0.9, minCount: 3, maxCount: 5 },
    ],
  });

  console.log('✅ Сиды успешно загружены!');
}

main()
  .catch((e) => {
    console.error('Ошибка сидов', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });