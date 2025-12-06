import { Test, TestingModule } from '@nestjs/testing';
import { LootService } from './loot.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LootService', () => {
  let service: LootService;
  let prisma: PrismaService;

  const mockItem = {
    id: 1,
    name: 'Ржавый меч',
    type: 'weapon',
    description: 'Восстанавливает HP',
    rarity: 'common',
    damage: 0,
    armor: 0,
    bonusStr: 0,
    bonusAgi: 0,
    bonusInt: 0,
    minLevel: 1,
    minStrength: 0,
    minAgility: 0,
    minIntelligence: 0,
    sellPrice: 5,
  };

  const mockMonsterLoot = [
    {
      id: 1,
      monsterId: 1,
      itemId: 1,
      dropChance: 0.5,
      minCount: 1,
      maxCount: 3,
      item: mockItem,
    },
    {
      id: 2,
      monsterId: 1,
      itemId: 2,
      dropChance: 0.1,
      minCount: 1,
      maxCount: 1,
      item: {
        ...mockItem,
        id: 2,
        name: 'Редкий Меч',
        type: 'weapon',
        rarity: 'rare',
      },
    },
  ];

  const mockCharacter = {
    id: 1,
    userId: 1,
    name: 'Тестовый Воин',
    class: 'warrior',
    level: 5,
    experience: 100,
    freePoints: 0,
    strength: 20,
    agility: 10,
    intelligence: 8,
    maxHp: 150,
    currentHp: 150,
    gold: 100,
    stamina: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    inventory: {
      id: 1,
      characterId: 1,
      size: 20,
    },
  };

  const mockInventoryItem = {
    id: 1,
    inventoryId: 1,
    itemId: 1,
    quantity: 2,
    enhancement: 0,
    isEquipped: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LootService,
        {
          provide: PrismaService,
          useValue: {
            monsterLoot: {
              findMany: jest.fn(),
            },
            character: {
              findUnique: jest.fn(),
            },
            inventoryItem: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LootService>(LootService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('generateLoot', () => {
    it('должен сгенерировать лут если дроп выпал', async () => {
      jest.spyOn(prisma.monsterLoot, 'findMany').mockResolvedValue(mockMonsterLoot);
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.3) // Первый предмет выпадет (0.3 <= 0.5)
        .mockReturnValueOnce(0.5) // Для randomInt - количество
        .mockReturnValueOnce(0.2); // Второй предмет не выпадет (0.2 > 0.1)

      const result = await service.generateLoot(1);

      expect(prisma.monsterLoot.findMany).toHaveBeenCalledWith({
        where: { monsterId: 1 },
        include: { item: true },
      });

      expect(result).toHaveLength(1);
      expect(result[0].itemId).toBe(1);
      expect(result[0].quantity).toBeGreaterThanOrEqual(1);
      expect(result[0].quantity).toBeLessThanOrEqual(3);
    });

    it('должен вернуть пустой массив если ничего не выпало', async () => {
      jest.spyOn(prisma.monsterLoot, 'findMany').mockResolvedValue(mockMonsterLoot);
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.8) // Первый предмет не выпадет (0.8 > 0.5*1.5=0.75)
        .mockReturnValueOnce(0.2); // Второй предмет не выпадет (0.2 > 0.1*1.5=0.15)

      const result = await service.generateLoot(1);

      expect(result).toEqual([]);
    });

    it('должен сгенерировать все предметы если все дропы выпали', async () => {
      jest.spyOn(prisma.monsterLoot, 'findMany').mockResolvedValue(mockMonsterLoot);
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.4) // Первый выпадет (0.4 <= 0.5)
        .mockReturnValueOnce(0.5) // randomInt для первого
        .mockReturnValueOnce(0.05) // Второй выпадет (0.05 <= 0.1)
        .mockReturnValueOnce(0.5); // randomInt для второго

      const result = await service.generateLoot(1);

      expect(result).toHaveLength(2);
      expect(result[0].itemId).toBe(1);
      expect(result[1].itemId).toBe(2);
    });

    it('должен вернуть пустой массив если у монстра нет лута', async () => {
      jest.spyOn(prisma.monsterLoot, 'findMany').mockResolvedValue([]);

      const result = await service.generateLoot(999);

      expect(result).toEqual([]);
    });

    it('должен генерировать корректное количество предметов', async () => {
      const singleLoot = [
        {
          id: 1,
          monsterId: 1,
          itemId: 1,
          dropChance: 1.0, // 100% дроп
          minCount: 5,
          maxCount: 10,
          item: mockItem,
        },
      ];

      jest.spyOn(prisma.monsterLoot, 'findMany').mockResolvedValue(singleLoot);
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.5) // Дроп выпадет
        .mockReturnValueOnce(0.5); // randomInt даст среднее значение

      const result = await service.generateLoot(1);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBeGreaterThanOrEqual(5);
      expect(result[0].quantity).toBeLessThanOrEqual(10);
    });
  });

  describe('addItemsToInventory', () => {
    it('должен создать новый предмет в инвентаре', async () => {
      const lootedItems = [{ itemId: 1, quantity: 3 }];

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);
      jest.spyOn(prisma.inventoryItem, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.inventoryItem, 'create').mockResolvedValue(mockInventoryItem);

      await service.addItemsToInventory(1, lootedItems);

      expect(prisma.inventoryItem.create).toHaveBeenCalledWith({
        data: {
          inventoryId: 1,
          itemId: 1,
          quantity: 3,
        },
      });
    });

    it('должен увеличить количество существующего предмета', async () => {
      const lootedItems = [{ itemId: 1, quantity: 5 }];

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);
      jest.spyOn(prisma.inventoryItem, 'findFirst').mockResolvedValue(mockInventoryItem);
      jest.spyOn(prisma.inventoryItem, 'update').mockResolvedValue({
        ...mockInventoryItem,
        quantity: 7,
      });

      await service.addItemsToInventory(1, lootedItems);

      expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: 7 }, // 2 + 5
      });
    });

    it('должен добавить несколько разных предметов', async () => {
      const lootedItems = [
        { itemId: 1, quantity: 2 },
        { itemId: 2, quantity: 1 },
      ];

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);
      jest.spyOn(prisma.inventoryItem, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.inventoryItem, 'create').mockResolvedValue(mockInventoryItem);

      await service.addItemsToInventory(1, lootedItems);

      expect(prisma.inventoryItem.create).toHaveBeenCalledTimes(2);
      expect(prisma.inventoryItem.create).toHaveBeenNthCalledWith(1, {
        data: {
          inventoryId: 1,
          itemId: 1,
          quantity: 2,
        },
      });
      expect(prisma.inventoryItem.create).toHaveBeenNthCalledWith(2, {
        data: {
          inventoryId: 1,
          itemId: 2,
          quantity: 1,
        },
      });
    });

    it('должен выбросить ошибку если персонаж не найден', async () => {
      const lootedItems = [{ itemId: 1, quantity: 1 }];

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      await expect(service.addItemsToInventory(999, lootedItems)).rejects.toThrow(
        'Character or inventory not found',
      );
    });

    it('должен выбросить ошибку если у персонажа нет инвентаря', async () => {
      const lootedItems = [{ itemId: 1, quantity: 1 }];

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        inventory: null,
      });

      await expect(service.addItemsToInventory(1, lootedItems)).rejects.toThrow(
        'Character or inventory not found',
      );
    });

    it('не должен ничего делать если лут пустой', async () => {
      const lootedItems = [];

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);

      await service.addItemsToInventory(1, lootedItems);

      expect(prisma.inventoryItem.findFirst).not.toHaveBeenCalled();
      expect(prisma.inventoryItem.create).not.toHaveBeenCalled();
      expect(prisma.inventoryItem.update).not.toHaveBeenCalled();
    });

    it('не должен стакать экипированные предметы', async () => {
      const lootedItems = [{ itemId: 1, quantity: 3 }];

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);
      jest.spyOn(prisma.inventoryItem, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.inventoryItem, 'create').mockResolvedValue(mockInventoryItem);

      await service.addItemsToInventory(1, lootedItems);

      expect(prisma.inventoryItem.findFirst).toHaveBeenCalledWith({
        where: {
          inventoryId: 1,
          itemId: 1,
          isEquipped: false, // Важно: ищет только не экипированные
        },
      });

      expect(prisma.inventoryItem.create).toHaveBeenCalled();
    });
  });
});