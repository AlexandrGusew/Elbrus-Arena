import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Пропускаем ошибки если пользователи уже созданы
  try {
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
      skipDuplicates: true,
    });
  } catch (e) {
    console.log('⚠️  Пользователи уже существуют, пропускаем...');
  }

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

  // Щиты для паладина
  const woodenShield = await prisma.item.create({
    data: {
      name: 'Деревянный щит',
      type: 'shield',
      description: 'Базовый щит для паладина',
      armor: 5,
      price: 0,
      minLevel: 1,
    },
  });

  // Яды для отравителя
  const basicPoison = await prisma.item.create({
    data: {
      name: 'Базовый яд',
      type: 'offhand',
      description: 'Базовый яд для отравителя',
      damage: 3,
      price: 0,
      minLevel: 1,
    },
  });

  // Петы для магов
  const waterElemental = await prisma.item.create({
    data: {
      name: 'Водный элементаль',
      type: 'offhand',
      description: 'Призванный элементаль для мага льда (Tier 1)',
      damage: 5,
      price: 0,
      minLevel: 1,
    },
  });

  const imp = await prisma.item.create({
    data: {
      name: 'Бес',
      type: 'offhand',
      description: 'Призванный бес для чернокнижника (Tier 1)',
      damage: 4,
      price: 0,
      minLevel: 1,
    },
  });

  // Проверяем существуют ли подземелья
  let easyDungeon = await prisma.dungeon.findFirst({ where: { difficulty: 'easy' } });
  if (!easyDungeon) {
    easyDungeon = await prisma.dungeon.create({
      data: {
        name: 'Подземелье',
        difficulty: 'easy',
        staminaCost: 20,
        expReward: 50,
        goldReward: 30,
      },
    });
  }

  let mediumDungeon = await prisma.dungeon.findFirst({ where: { difficulty: 'medium' } });
  if (!mediumDungeon) {
    mediumDungeon = await prisma.dungeon.create({
      data: {
        name: 'Подземелье',
        difficulty: 'medium',
        staminaCost: 20,
        expReward: 75,
        goldReward: 45,
      },
    });
  }

  let hardDungeon = await prisma.dungeon.findFirst({ where: { difficulty: 'hard' } });
  if (!hardDungeon) {
    hardDungeon = await prisma.dungeon.create({
      data: {
        name: 'Подземелье',
        difficulty: 'hard',
        staminaCost: 20,
        expReward: 100,
        goldReward: 60,
      },
    });
  }


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

  // СПЕЦИАЛИЗАЦИИ - 18 способностей (6 веток × 3 тира)
  await prisma.specializationAbility.createMany({
    data: [
      // WARRIOR - PALADIN
      {
        branch: 'PALADIN',
        tier: 1,
        name: 'Мастерство щита',
        description: 'Открывает слот щита. +10% к броне',
        cooldown: 0,
        effects: { type: 'passive', armorBonus: 10 },
      },
      {
        branch: 'PALADIN',
        tier: 2,
        name: 'Божественное благословение',
        description: '+30% к броне на 3 хода',
        cooldown: 5,
        effects: { type: 'buff', armorBonus: 30, duration: 3 },
      },
      {
        branch: 'PALADIN',
        tier: 3,
        name: 'Божественный щит',
        description: 'Неуязвимость на 1 ход',
        cooldown: 10,
        effects: { type: 'ultimate', invulnerability: true, duration: 1 },
      },

      // WARRIOR - BARBARIAN
      {
        branch: 'BARBARIAN',
        tier: 1,
        name: 'Двойное оружие',
        description: 'Открывает второй слот оружия. +15% к урону',
        cooldown: 0,
        effects: { type: 'passive', damageBonus: 15 },
      },
      {
        branch: 'BARBARIAN',
        tier: 2,
        name: 'Боевая ярость',
        description: '+40% к урону на 3 хода',
        cooldown: 5,
        effects: { type: 'buff', damageBonus: 40, duration: 3 },
      },
      {
        branch: 'BARBARIAN',
        tier: 3,
        name: 'Кровожадность',
        description: '+100% к урону, кровотечение (+10% урона 2 хода)',
        cooldown: 10,
        effects: { type: 'ultimate', damageBonus: 100, bleed: { damageBonus: 10, duration: 2 } },
      },

      // ROGUE - SHADOW_DANCER
      {
        branch: 'SHADOW_DANCER',
        tier: 1,
        name: 'Удар в спину',
        description: 'Создает 5-ю зону атаки (враг защищает 3 из 5)',
        cooldown: 0,
        effects: { type: 'passive', zones: 5, defendZones: 3 },
      },
      {
        branch: 'SHADOW_DANCER',
        tier: 2,
        name: 'Теневой шаг',
        description: '+50% к уклонению на 2 хода',
        cooldown: 4,
        effects: { type: 'buff', evasionBonus: 50, duration: 2 },
      },
      {
        branch: 'SHADOW_DANCER',
        tier: 3,
        name: 'Теневой клон',
        description: 'Призывает клона с 50% характеристик на 3 хода',
        cooldown: 8,
        effects: { type: 'ultimate', summon: 'clone', statsPercent: 50, duration: 3 },
      },

      // ROGUE - POISONER
      {
        branch: 'POISONER',
        tier: 1,
        name: 'Мастерство яда',
        description: 'Все атаки наносят яд (+5% урона в ход)',
        cooldown: 0,
        effects: { type: 'passive', poison: { damagePercent: 5 } },
      },
      {
        branch: 'POISONER',
        tier: 2,
        name: 'Токсичное покрытие',
        description: 'Яд наносит +15% урона в ход на 4 хода',
        cooldown: 5,
        effects: { type: 'buff', poison: { damagePercent: 15, duration: 4 } },
      },
      {
        branch: 'POISONER',
        tier: 3,
        name: 'Смертельный токсин',
        description: 'Яд наносит 50% текущего HP врага за 5 ходов',
        cooldown: 10,
        effects: { type: 'ultimate', poison: { hpPercent: 50, duration: 5 } },
      },

      // MAGE - FROST_MAGE
      {
        branch: 'FROST_MAGE',
        tier: 1,
        name: 'Призыв водного элементаля',
        description: 'Призывает элементаля с 50% характеристик',
        cooldown: 0,
        effects: { type: 'passive', summon: 'water_elemental', statsPercent: 50 },
      },
      {
        branch: 'FROST_MAGE',
        tier: 2,
        name: 'Ледяная броня',
        description: 'Враг не может защищаться на 2 хода',
        cooldown: 6,
        effects: { type: 'buff', disableDefense: true, duration: 2 },
      },
      {
        branch: 'FROST_MAGE',
        tier: 3,
        name: 'Ледяная гробница',
        description: 'Враг заморожен на 2 хода (не атакует, не защищается)',
        cooldown: 12,
        effects: { type: 'ultimate', freeze: true, duration: 2 },
      },

      // MAGE - WARLOCK
      {
        branch: 'WARLOCK',
        tier: 1,
        name: 'Призыв беса',
        description: 'Призывает беса. Страх: враг защищает 2 из 4 зон',
        cooldown: 0,
        effects: { type: 'passive', summon: 'imp', fear: { zones: 4, defendZones: 2 } },
      },
      {
        branch: 'WARLOCK',
        tier: 2,
        name: 'Темный пакт',
        description: 'Жертвует 20% HP, получает +50% урона на 3 хода',
        cooldown: 5,
        effects: { type: 'buff', hpCost: 20, damageBonus: 50, duration: 3 },
      },
      {
        branch: 'WARLOCK',
        tier: 3,
        name: 'Демонический пакт',
        description: 'Превращается в демона: +100% ко всем характеристикам на 3 хода',
        cooldown: 10,
        effects: { type: 'ultimate', transform: 'demon', allStatsBonus: 100, duration: 3 },
      },
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