import { Test, TestingModule } from '@nestjs/testing';
import { InventoryEnhancementService } from './inventory-enhancement.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InventoryEnhancementService', () => {
  let service: InventoryEnhancementService;
  let prisma: PrismaService;

  const mockOffhandItem = {
    id: 1,
    itemId: 10,
    inventoryId: 1,
    enhancement: 2,
    isEquipped: true,
    item: {
      id: 10,
      name: 'Щит воина',
      description: 'Крепкий щит',
      type: 'shield',
      damage: 0,
      armor: 10,
      strength: 0,
      agility: 0,
      intelligence: 0,
      requiredLevel: 1,
      sellPrice: 50,
    },
  };

  const mockCharacterWithOffhand = {
    id: 1,
    userId: 1,
    name: 'Тестовый Воин',
    class: 'warrior',
    level: 20,
    experience: 50000,
    freePoints: 5,
    superPoints: 2,
    strength: 15,
    agility: 8,
    intelligence: 5,
    maxHp: 150,
    currentHp: 150,
    armor: 0,
    gold: 1000,
    stamina: 100,
    rating: 0,
    lastStaminaUpdate: new Date(),
    createdAt: new Date(),
    specialization: {
      id: 1,
      characterId: 1,
      branch: 'Защитник',
      tier: 1,
      abilities: [],
    },
    inventory: {
      id: 1,
      characterId: 1,
      size: 20,
      items: [mockOffhandItem],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryEnhancementService,
        {
          provide: PrismaService,
          useValue: {
            character: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            inventoryItem: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryEnhancementService>(InventoryEnhancementService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enhanceOffhandWithSuperPoint', () => {
    it('should successfully enhance offhand item with superPoint', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacterWithOffhand);

      const updatedItem = { ...mockOffhandItem, enhancement: 3 };
      jest.spyOn(prisma, '$transaction').mockResolvedValue([updatedItem, null]);

      const result = await service.enhanceOffhandWithSuperPoint(1);

      expect(result).toEqual({
        newEnhancementLevel: 3,
        itemName: 'Щит воина',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if character not found', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      await expect(service.enhanceOffhandWithSuperPoint(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.enhanceOffhandWithSuperPoint(999)).rejects.toThrow(
        'Character not found',
      );
    });

    it('should throw BadRequestException if insufficient superPoints', async () => {
      const charWithoutPoints = {
        ...mockCharacterWithOffhand,
        superPoints: 0,
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithoutPoints);

      await expect(service.enhanceOffhandWithSuperPoint(1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.enhanceOffhandWithSuperPoint(1)).rejects.toThrow(
        'Недостаточно супер-поинтов',
      );
    });

    it('should throw BadRequestException if no specialization', async () => {
      const charWithoutSpec = {
        ...mockCharacterWithOffhand,
        specialization: null,
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithoutSpec);

      await expect(service.enhanceOffhandWithSuperPoint(1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.enhanceOffhandWithSuperPoint(1)).rejects.toThrow(
        'У персонажа нет специализации',
      );
    });

    it('should throw BadRequestException if no equipped offhand', async () => {
      const charWithoutOffhand = {
        ...mockCharacterWithOffhand,
        inventory: {
          ...mockCharacterWithOffhand.inventory,
          items: [], // Нет предметов
        },
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithoutOffhand);

      await expect(service.enhanceOffhandWithSuperPoint(1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.enhanceOffhandWithSuperPoint(1)).rejects.toThrow(
        'У персонажа нет экипированного offhand предмета',
      );
    });

    it('should work with offhand type item', async () => {
      const mockWeaponOffhand = {
        ...mockOffhandItem,
        item: {
          ...mockOffhandItem.item,
          type: 'offhand',
          name: 'Кинжал',
        },
      };

      const charWithOffhandWeapon = {
        ...mockCharacterWithOffhand,
        inventory: {
          ...mockCharacterWithOffhand.inventory,
          items: [mockWeaponOffhand],
        },
      };

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithOffhandWeapon);

      const updatedItem = { ...mockWeaponOffhand, enhancement: 3 };
      jest.spyOn(prisma, '$transaction').mockResolvedValue([updatedItem, null]);

      const result = await service.enhanceOffhandWithSuperPoint(1);

      expect(result).toEqual({
        newEnhancementLevel: 3,
        itemName: 'Кинжал',
      });
    });

    it('should increment enhancement from current level', async () => {
      const highEnhancementItem = {
        ...mockOffhandItem,
        enhancement: 5,
      };

      const charWithHighEnhancement = {
        ...mockCharacterWithOffhand,
        inventory: {
          ...mockCharacterWithOffhand.inventory,
          items: [highEnhancementItem],
        },
      };

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithHighEnhancement);

      const updatedItem = { ...highEnhancementItem, enhancement: 6 };
      jest.spyOn(prisma, '$transaction').mockResolvedValue([updatedItem, null]);

      const result = await service.enhanceOffhandWithSuperPoint(1);

      expect(result.newEnhancementLevel).toBe(6);
    });

    it('should use transaction for atomic operation', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacterWithOffhand);

      const updatedItem = { ...mockOffhandItem, enhancement: 3 };
      const transactionSpy = jest.spyOn(prisma, '$transaction').mockResolvedValue([updatedItem, null]);

      await service.enhanceOffhandWithSuperPoint(1);

      // Проверяем что транзакция вызвана с двумя операциями
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      const transactionOps = transactionSpy.mock.calls[0][0];
      expect(transactionOps).toHaveLength(2); // Должно быть 2 операции: update item + update character
    });
  });

  describe('getEnhancementInfo', () => {
    it('should return enhancement info for valid item', async () => {
      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(mockOffhandItem);

      const result = await service.getEnhancementInfo(1);

      expect(result).toEqual({
        currentEnhancement: 2,
        enhancementCost: 900, // 100 * (2+1)^2
        successRate: 0.2,
        statBonus: 0.2, // 2 * 0.1
      });
    });

    it('should throw NotFoundException for non-existent item', async () => {
      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(null);

      await expect(service.getEnhancementInfo(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for potion type', async () => {
      const potionItem = {
        ...mockOffhandItem,
        item: {
          ...mockOffhandItem.item,
          type: 'potion',
        },
      };
      jest.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue(potionItem);

      await expect(service.getEnhancementInfo(1)).rejects.toThrow(BadRequestException);
      await expect(service.getEnhancementInfo(1)).rejects.toThrow(
        'Potions cannot be enhanced',
      );
    });
  });

  describe('enhanceItem (regular gold enhancement)', () => {
    it('should successfully enhance item with gold', async () => {
      const weaponItem = {
        id: 2,
        itemId: 11,
        inventoryId: 1,
        enhancement: 0,
        isEquipped: true,
        item: {
          id: 11,
          name: 'Меч воина',
          description: 'Острый меч',
          type: 'weapon',
          damage: 20,
          armor: 0,
          strength: 0,
          agility: 0,
          intelligence: 0,
          requiredLevel: 1,
          sellPrice: 100,
        },
      };

      const charWithGold = {
        ...mockCharacterWithOffhand,
        gold: 500,
        inventory: {
          ...mockCharacterWithOffhand.inventory,
          items: [weaponItem],
        },
      };

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithGold);
      jest.spyOn(prisma.character, 'update').mockResolvedValue({
        ...charWithGold,
        gold: 400, // 500 - 100
      });

      // Мокаем успешную заточку (20% шанс)
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.2 = успех

      jest.spyOn(prisma.inventoryItem, 'update').mockResolvedValue({
        ...weaponItem,
        enhancement: 1,
      });

      const result = await service.enhanceItem(1, 2);

      expect(result.success).toBe(true);
      expect(result.newEnhancementLevel).toBe(1);
      expect(result.goldSpent).toBe(100);
    });

    it('should fail enhancement but still spend gold', async () => {
      const weaponItem = {
        id: 2,
        itemId: 11,
        inventoryId: 1,
        enhancement: 0,
        isEquipped: true,
        item: {
          id: 11,
          name: 'Меч воина',
          description: 'Острый меч',
          type: 'weapon',
          damage: 20,
          armor: 0,
          strength: 0,
          agility: 0,
          intelligence: 0,
          requiredLevel: 1,
          sellPrice: 100,
        },
      };

      const charWithGold = {
        ...mockCharacterWithOffhand,
        gold: 500,
        inventory: {
          ...mockCharacterWithOffhand.inventory,
          items: [weaponItem],
        },
      };

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithGold);
      jest.spyOn(prisma.character, 'update').mockResolvedValue({
        ...charWithGold,
        gold: 400, // 500 - 100
      });

      // Мокаем неудачную заточку (80% шанс провала)
      jest.spyOn(Math, 'random').mockReturnValue(0.9); // >= 0.2 = провал

      const result = await service.enhanceItem(1, 2);

      expect(result.success).toBe(false);
      expect(result.newEnhancementLevel).toBe(0); // Не изменился
      expect(result.goldSpent).toBe(100); // Золото все равно потрачено
      expect(prisma.inventoryItem.update).not.toHaveBeenCalled(); // Предмет не обновлялся
    });

    it('should throw BadRequestException if not enough gold', async () => {
      const weaponItem = {
        id: 2,
        itemId: 11,
        inventoryId: 1,
        enhancement: 0,
        isEquipped: true,
        item: {
          id: 11,
          name: 'Меч воина',
          description: 'Острый меч',
          type: 'weapon',
          damage: 20,
          armor: 0,
          strength: 0,
          agility: 0,
          intelligence: 0,
          requiredLevel: 1,
          sellPrice: 100,
        },
      };

      const charWithoutGold = {
        ...mockCharacterWithOffhand,
        gold: 50, // Недостаточно
        inventory: {
          ...mockCharacterWithOffhand.inventory,
          items: [weaponItem],
        },
      };

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithoutGold);

      await expect(service.enhanceItem(1, 2)).rejects.toThrow(BadRequestException);
      await expect(service.enhanceItem(1, 2)).rejects.toThrow('Недостаточно золота');
    });

    it('should throw BadRequestException for potion enhancement attempt', async () => {
      const potionItem = {
        id: 3,
        itemId: 12,
        inventoryId: 1,
        enhancement: 0,
        isEquipped: false,
        item: {
          id: 12,
          name: 'Зелье лечения',
          description: 'Восстанавливает HP',
          type: 'potion',
          damage: 0,
          armor: 0,
          strength: 0,
          agility: 0,
          intelligence: 0,
          requiredLevel: 1,
          sellPrice: 20,
        },
      };

      const charWithPotion = {
        ...mockCharacterWithOffhand,
        inventory: {
          ...mockCharacterWithOffhand.inventory,
          items: [potionItem],
        },
      };

      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(charWithPotion);

      await expect(service.enhanceItem(1, 3)).rejects.toThrow(BadRequestException);
      await expect(service.enhanceItem(1, 3)).rejects.toThrow('Cannot enhance potions');
    });
  });
});
