import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

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
      items: [],
    },
  };

  const mockItem = {
    id: 1,
    name: 'Меч Новичка',
    type: 'weapon',
    description: 'Простой меч',
    rarity: 'common',
    damage: 10,
    armor: 0,
    bonusStr: 2,
    bonusAgi: 0,
    bonusInt: 0,
    minLevel: 1,
    minStrength: 10,
    minAgility: 0,
    minIntelligence: 0,
    price: 10,
  };

  const mockInventoryItem = {
    id: 1,
    inventoryId: 1,
    itemId: 1,
    quantity: 1,
    enhancement: 0,
    isEquipped: false,
    item: mockItem,
  };

  const mockInventory = {
    id: 1,
    characterId: 1,
    size: 20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: {
            inventoryItem: {
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            inventory: {
              findFirst: jest.fn(),
            },
            character: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('equipItem', () => {
    it('должен успешно экипировать предмет', async () => {
      jest
        .spyOn(prisma.inventoryItem, 'findUnique')
        .mockResolvedValue(mockInventoryItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [],
        },
      });
      jest.spyOn(prisma.inventoryItem, 'update').mockResolvedValue({
        ...mockInventoryItem,
        isEquipped: true,
      });

      await service.equipItem(1, 1);

      expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isEquipped: true },
      });
    });

    it('должен выбросить NotFoundException если предмет не найден', async () => {
      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(null);

      await expect(service.equipItem(1, 1)).rejects.toThrow(NotFoundException);
      expect(prisma.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { item: true },
      });
    });

    it('должен выбросить BadRequestException при попытке экипировать зелье', async () => {
      const potionItem = {
        ...mockInventoryItem,
        item: {
          ...mockItem,
          type: 'potion',
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(potionItem);

      await expect(service.equipItem(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('должен выбросить ForbiddenException если предмет не принадлежит персонажу', async () => {
      jest
        .spyOn(prisma.inventoryItem, 'findUnique')
        .mockResolvedValue(mockInventoryItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(null);

      await expect(service.equipItem(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('должен выбросить NotFoundException если персонаж не найден', async () => {
      jest
        .spyOn(prisma.inventoryItem, 'findUnique')
        .mockResolvedValue(mockInventoryItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      await expect(service.equipItem(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException если уровень персонажа слишком низкий', async () => {
      const highLevelItem = {
        ...mockInventoryItem,
        item: {
          ...mockItem,
          minLevel: 10,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(highLevelItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        level: 5,
      });

      await expect(service.equipItem(1, 1)).rejects.toThrow(
        new ForbiddenException('Level 10 required'),
      );
    });

    it('должен выбросить ForbiddenException если сила персонажа недостаточна', async () => {
      const highStrItem = {
        ...mockInventoryItem,
        item: {
          ...mockItem,
          minStrength: 50,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(highStrItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        strength: 20,
      });

      await expect(service.equipItem(1, 1)).rejects.toThrow(
        new ForbiddenException('Strength 50 required'),
      );
    });

    it('должен выбросить ForbiddenException если ловкость персонажа недостаточна', async () => {
      const highAgiItem = {
        ...mockInventoryItem,
        item: {
          ...mockItem,
          minAgility: 30,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(highAgiItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        agility: 10,
      });

      await expect(service.equipItem(1, 1)).rejects.toThrow(
        new ForbiddenException('Agility 30 required'),
      );
    });

    it('должен выбросить ForbiddenException если интеллект персонажа недостаточен', async () => {
      const highIntItem = {
        ...mockInventoryItem,
        item: {
          ...mockItem,
          minIntelligence: 25,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(highIntItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        intelligence: 8,
      });

      await expect(service.equipItem(1, 1)).rejects.toThrow(
        new ForbiddenException('Intelligence 25 required'),
      );
    });

    it('должен снять уже экипированный предмет того же типа', async () => {
      const equippedWeapon = {
        id: 2,
        inventoryId: 1,
        itemId: 2,
        quantity: 1,
        enhancement: 0,
        isEquipped: true,
        item: {
          ...mockItem,
          id: 2,
          name: 'Старый Меч',
        },
      };

      jest
        .spyOn(prisma.inventoryItem, 'findUnique')
        .mockResolvedValue(mockInventoryItem);
      jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        inventory: {
          ...mockCharacter.inventory,
          items: [equippedWeapon],
        },
      });

      const updateSpy = jest
        .spyOn(prisma.inventoryItem, 'update')
        .mockResolvedValue(mockInventoryItem);

      await service.equipItem(1, 1);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { isEquipped: false },
      });

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isEquipped: true },
      });

      expect(updateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('unequipItem', () => {
    it('должен успешно снять предмет', async () => {
      const equippedItem = {
        ...mockInventoryItem,
        isEquipped: true,
        inventory: {
          ...mockInventory,
          character: {
            ...mockCharacter,
            specialization: null,
          },
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(equippedItem);
      jest.spyOn(prisma.inventoryItem, 'update').mockResolvedValue({
        ...equippedItem,
        isEquipped: false,
      });

      await service.unequipItem(1);

      expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isEquipped: false },
      });
    });

    it('должен выбросить NotFoundException если предмет не найден', async () => {
      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(null);

      await expect(service.unequipItem(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Валидация offhand по специализации', () => {
    describe('PALADIN - только щиты', () => {
      it('должен разрешить паладину экипировать щит', async () => {
        const shieldItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'shield',
            name: 'Щит Новичка',
          },
        };

        const paladinCharacter = {
          ...mockCharacter,
          specialization: {
            id: 1,
            characterId: 1,
            branch: 'PALADIN',
            tier1Unlocked: true,
            tier2Unlocked: false,
            tier3Unlocked: false,
          },
          inventory: {
            ...mockCharacter.inventory,
            items: [],
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(shieldItem);
        jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
        jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(paladinCharacter);
        jest.spyOn(prisma.inventoryItem, 'update').mockResolvedValue(shieldItem);

        await service.equipItem(1, 1);

        expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { isEquipped: true },
        });
      });

      it('должен запретить паладину экипировать оружие в offhand', async () => {
        const weaponItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'weapon',
            name: 'Кинжал',
          },
        };

        // У паладина уже есть основное оружие
        const equippedMainWeapon = {
          id: 10,
          inventoryId: 1,
          itemId: 10,
          quantity: 1,
          enhancement: 0,
          isEquipped: true,
          item: {
            ...mockItem,
            id: 10,
            name: 'Основной меч',
            type: 'weapon',
          },
        };

        const paladinCharacter = {
          ...mockCharacter,
          specialization: {
            id: 1,
            characterId: 1,
            branch: 'PALADIN',
            tier1Unlocked: true,
            tier2Unlocked: false,
            tier3Unlocked: false,
          },
          inventory: {
            ...mockCharacter.inventory,
            items: [equippedMainWeapon],
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(weaponItem);
        jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
        jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(paladinCharacter);

        await expect(service.equipItem(1, 1)).rejects.toThrow(
          new ForbiddenException('Паладин может экипировать только щиты в offhand слот'),
        );
      });
    });

    describe('BARBARIAN - только оружие', () => {
      it('должен разрешить варвару экипировать оружие в offhand', async () => {
        const weaponItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'weapon',
            name: 'Топор',
          },
        };

        // У варвара уже есть основное оружие
        const equippedMainWeapon = {
          id: 11,
          inventoryId: 1,
          itemId: 11,
          quantity: 1,
          enhancement: 0,
          isEquipped: true,
          item: {
            ...mockItem,
            id: 11,
            name: 'Основной топор',
            type: 'weapon',
          },
        };

        const barbarianCharacter = {
          ...mockCharacter,
          specialization: {
            id: 2,
            characterId: 1,
            branch: 'BARBARIAN',
            tier1Unlocked: true,
            tier2Unlocked: false,
            tier3Unlocked: false,
          },
          inventory: {
            ...mockCharacter.inventory,
            items: [equippedMainWeapon],
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(weaponItem);
        jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
        jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(barbarianCharacter);
        jest.spyOn(prisma.inventoryItem, 'update').mockResolvedValue(weaponItem);

        await service.equipItem(1, 1);

        expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { isEquipped: true },
        });
      });

      it('должен запретить варвару экипировать щит', async () => {
        const shieldItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'shield',
            name: 'Щит',
          },
        };

        const barbarianCharacter = {
          ...mockCharacter,
          specialization: {
            id: 2,
            characterId: 1,
            branch: 'BARBARIAN',
            tier1Unlocked: true,
            tier2Unlocked: false,
            tier3Unlocked: false,
          },
          inventory: {
            ...mockCharacter.inventory,
            items: [],
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(shieldItem);
        jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
        jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(barbarianCharacter);

        await expect(service.equipItem(1, 1)).rejects.toThrow(
          new ForbiddenException('Варвар может экипировать только оружие в offhand слот'),
        );
      });
    });

    describe('POISONER - нельзя снять яд', () => {
      it('должен запретить отравителю снять яд', async () => {
        const poisonItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'offhand',
            name: 'Смертельный яд',
          },
          inventory: {
            ...mockInventory,
            character: {
              ...mockCharacter,
              specialization: {
                id: 3,
                characterId: 1,
                branch: 'POISONER',
                tier1Unlocked: true,
                tier2Unlocked: false,
                tier3Unlocked: false,
              },
            },
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(poisonItem);

        await expect(service.unequipItem(1)).rejects.toThrow(
          new ForbiddenException('Отравитель не может снять яд - он является частью специализации'),
        );
      });
    });

    describe('FROST_MAGE - нельзя снять элементаля', () => {
      it('должен запретить ледяному магу снять элементаля', async () => {
        const elementalItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'offhand',
            name: 'Водный элементаль',
          },
          inventory: {
            ...mockInventory,
            character: {
              ...mockCharacter,
              specialization: {
                id: 4,
                characterId: 1,
                branch: 'FROST_MAGE',
                tier1Unlocked: true,
                tier2Unlocked: false,
                tier3Unlocked: false,
              },
            },
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(elementalItem);

        await expect(service.unequipItem(1)).rejects.toThrow(
          new ForbiddenException('Ледяной маг не может снять элементаля - он является частью специализации'),
        );
      });
    });

    describe('WARLOCK - нельзя снять беса', () => {
      it('должен запретить чернокнижнику снять беса', async () => {
        const demonItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'offhand',
            name: 'Бес',
          },
          inventory: {
            ...mockInventory,
            character: {
              ...mockCharacter,
              specialization: {
                id: 5,
                characterId: 1,
                branch: 'WARLOCK',
                tier1Unlocked: true,
                tier2Unlocked: false,
                tier3Unlocked: false,
              },
            },
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(demonItem);

        await expect(service.unequipItem(1)).rejects.toThrow(
          new ForbiddenException('Чернокнижник не может снять беса - он является частью специализации'),
        );
      });
    });

    describe('Без специализации - нет ограничений', () => {
      it('должен разрешить экипировать любой offhand предмет без специализации', async () => {
        const offhandItem = {
          ...mockInventoryItem,
          item: {
            ...mockItem,
            type: 'offhand',
            name: 'Кинжал',
          },
        };

        const characterNoSpec = {
          ...mockCharacter,
          specialization: null,
          inventory: {
            ...mockCharacter.inventory,
            items: [],
          },
        };

        jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(offhandItem);
        jest.spyOn(prisma.inventory, 'findFirst').mockResolvedValue(mockInventory);
        jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterNoSpec);
        jest.spyOn(prisma.inventoryItem, 'update').mockResolvedValue(offhandItem);

        await service.equipItem(1, 1);

        expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { isEquipped: true },
        });
      });
    });
  });

  describe('sellItem', () => {
    it('должен успешно продать предмет за 50% цены', async () => {
      const itemWithInventory = {
        ...mockInventoryItem,
        inventory: {
          ...mockInventory,
          character: mockCharacter,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(itemWithInventory);

      prisma.$transaction = jest.fn().mockImplementation(async (operations) => {
        return Promise.all(operations);
      });

      const result = await service.sellItem(1, 1);

      expect(result.goldReceived).toBe(5);
      expect(result.itemName).toBe('Меч Новичка');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException если предмет не найден', async () => {
      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(null);

      await expect(service.sellItem(1, 1)).rejects.toThrow(
        new NotFoundException('Inventory item not found'),
      );
    });

    it('должен выбросить ForbiddenException если предмет не принадлежит персонажу', async () => {
      const itemWithWrongCharacter = {
        ...mockInventoryItem,
        inventory: {
          id: 1,
          characterId: 999,
          size: 20,
          character: {
            ...mockCharacter,
            id: 999,
          },
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(itemWithWrongCharacter);

      await expect(service.sellItem(1, 1)).rejects.toThrow(
        new ForbiddenException('This item does not belong to this character'),
      );
    });

    it('должен выбросить BadRequestException если предмет экипирован', async () => {
      const equippedItem = {
        ...mockInventoryItem,
        isEquipped: true,
        inventory: {
          ...mockInventory,
          character: mockCharacter,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(equippedItem);

      await expect(service.sellItem(1, 1)).rejects.toThrow(
        new BadRequestException('Cannot sell equipped items. Unequip first.'),
      );
    });

    it('должен правильно рассчитать цену продажи (50% от базовой)', async () => {
      const expensiveItem = {
        ...mockInventoryItem,
        item: {
          ...mockItem,
          price: 100,
        },
        inventory: {
          ...mockInventory,
          character: mockCharacter,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(expensiveItem);

      prisma.$transaction = jest.fn().mockImplementation(async (operations) => {
        return Promise.all(operations);
      });

      const result = await service.sellItem(1, 1);

      expect(result.goldReceived).toBe(50);
    });

    it('должен удалить предмет и начислить золото в транзакции', async () => {
      const itemWithInventory = {
        ...mockInventoryItem,
        inventory: {
          ...mockInventory,
          character: mockCharacter,
        },
      };

      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(itemWithInventory);

      const transactionSpy = jest.fn().mockImplementation(async (operations) => {
        return Promise.all(operations);
      });

      prisma.$transaction = transactionSpy;

      await service.sellItem(1, 1);

      expect(transactionSpy).toHaveBeenCalledTimes(1);
      const operations = transactionSpy.mock.calls[0][0];
      expect(operations).toHaveLength(2);
    });
  });
});