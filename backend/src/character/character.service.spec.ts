import { Test, TestingModule } from '@nestjs/testing';
import { CharacterService } from './character.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CLASS_STATS } from './character.constants';

describe('CharacterService', () => {
  let service: CharacterService;
  let prisma: PrismaService;
  let inventoryService: InventoryService;

  const mockUser = {
    id: 1,
    telegramId: BigInt(123456789),
    username: 'user_123456789',
    createdAt: new Date(),
  };

  const mockCharacter = {
    id: 1,
    userId: 1,
    name: 'Тестовый Воин',
    class: 'warrior',
    level: 1,
    experience: 0,
    freePoints: 0,
    strength: 15,
    agility: 8,
    intelligence: 5,
    maxHp: 150,
    currentHp: 150,
    gold: 0,
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

  const mockInventory = {
    id: 1,
    characterId: 1,
    size: 20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            character: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
            inventory: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: InventoryService,
          useValue: {
            equipItem: jest.fn(),
            unequipItem: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CharacterService>(CharacterService);
    prisma = module.get<PrismaService>(PrismaService);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('должен создать нового персонажа для существующего пользователя', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findByUserId').mockResolvedValue(null);

      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          character: {
            create: jest.fn().mockResolvedValue(mockCharacter),
          },
          inventory: {
            create: jest.fn().mockResolvedValue(mockInventory),
          },
        });
      });

      jest.spyOn(service, 'findById').mockResolvedValue(mockCharacter);

      const result = await service.create(123456789, 'Тестовый Воин', 'warrior');

      expect(result).toEqual(mockCharacter);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { telegramId: BigInt(123456789) },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('должен создать нового пользователя если его нет', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findByUserId').mockResolvedValue(null);

      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          character: {
            create: jest.fn().mockResolvedValue(mockCharacter),
          },
          inventory: {
            create: jest.fn().mockResolvedValue(mockInventory),
          },
        });
      });

      jest.spyOn(service, 'findById').mockResolvedValue(mockCharacter);

      const result = await service.create(123456789, 'Тестовый Воин', 'warrior');

      expect(result).toEqual(mockCharacter);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          telegramId: BigInt(123456789),
          username: 'user_123456789',
        },
      });
    });

    it('должен вернуть существующего персонажа', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findByUserId').mockResolvedValue(mockCharacter);

      const result = await service.create(123456789, 'Тестовый Воин', 'warrior');

      expect(result).toEqual(mockCharacter);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException при неизвестном классе', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findByUserId').mockResolvedValue(null);

      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          character: {
            create: jest.fn().mockImplementation(async (options) => {
              const classStats = CLASS_STATS[options.data.class];
              if (!classStats) {
                throw new BadRequestException(`Unknown class: ${options.data.class}`);
              }
              return mockCharacter;
            }),
          },
          inventory: {
            create: jest.fn().mockResolvedValue(mockInventory),
          },
        };
        return callback(tx);
      });

      await expect(
        service.create(123456789, 'Тестовый', 'invalid' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('должен создать инвентарь вместе с персонажем в транзакции', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findByUserId').mockResolvedValue(null);

      const mockInventoryCreate = jest.fn().mockResolvedValue(mockInventory);
      const mockCharacterCreate = jest.fn().mockResolvedValue(mockCharacter);

      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          character: { create: mockCharacterCreate },
          inventory: { create: mockInventoryCreate },
        });
      });

      jest.spyOn(service, 'findById').mockResolvedValue(mockCharacter);

      await service.create(123456789, 'Тестовый Воин', 'warrior');

      expect(mockCharacterCreate).toHaveBeenCalled();
      expect(mockInventoryCreate).toHaveBeenCalledWith({
        data: {
          characterId: mockCharacter.id,
          size: 20,
        },
      });
    });

    it('должен выбросить NotFoundException если персонаж не загрузился после создания', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'findByUserId').mockResolvedValue(null);

      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          character: {
            create: jest.fn().mockResolvedValue(mockCharacter),
          },
          inventory: {
            create: jest.fn().mockResolvedValue(mockInventory),
          },
        });
      });

      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(
        service.create(123456789, 'Тестовый Воин', 'warrior'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('должен найти персонажа по ID', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);

      const result = await service.findById(1);

      expect(result).toEqual(mockCharacter);
      expect(prisma.character.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          inventory: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      });
    });

    it('должен вернуть null если персонаж не найден', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('должен найти персонажа по userId', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);

      const result = await service.findByUserId(1);

      expect(result).toEqual(mockCharacter);
      expect(prisma.character.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          inventory: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      });
    });

    it('должен вернуть null если персонаж не найден', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      const result = await service.findByUserId(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('должен найти персонажа по имени', async () => {
      jest.spyOn(prisma.character, 'findFirst').mockResolvedValue(mockCharacter);

      const result = await service.findByName('Тестовый Воин');

      expect(result).toEqual(mockCharacter);
      expect(prisma.character.findFirst).toHaveBeenCalledWith({
        where: { name: 'Тестовый Воин' },
        include: {
          inventory: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      });
    });

    it('должен вернуть null если персонаж с таким именем не найден', async () => {
      jest.spyOn(prisma.character, 'findFirst').mockResolvedValue(null);

      const result = await service.findByName('НесуществующийПерсонаж');

      expect(result).toBeNull();
    });

    it('должен быть регистрозависимым при поиске', async () => {
      jest.spyOn(prisma.character, 'findFirst').mockResolvedValue(null);

      await service.findByName('тестовый воин');

      expect(prisma.character.findFirst).toHaveBeenCalledWith({
        where: { name: 'тестовый воин' },
        include: {
          inventory: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('equipItem', () => {
    it('должен экипировать предмет и вернуть обновленного персонажа', async () => {
      jest.spyOn(inventoryService, 'equipItem').mockResolvedValue(undefined);
      jest.spyOn(service, 'findById').mockResolvedValue(mockCharacter);

      const result = await service.equipItem(1, 5);

      expect(inventoryService.equipItem).toHaveBeenCalledWith(1, 5);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCharacter);
    });
  });

  describe('unequipItem', () => {
    it('должен снять предмет и вернуть обновленного персонажа', async () => {
      jest.spyOn(inventoryService, 'unequipItem').mockResolvedValue(undefined);
      jest.spyOn(service, 'findById').mockResolvedValue(mockCharacter);

      const result = await service.unequipItem(1, 5);

      expect(inventoryService.unequipItem).toHaveBeenCalledWith(5);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCharacter);
    });
  });
});