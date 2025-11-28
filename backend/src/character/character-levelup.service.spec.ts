import { Test, TestingModule } from '@nestjs/testing';
import { CharacterLevelUpService } from './character-levelup.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CharacterLevelUpService', () => {
  let service: CharacterLevelUpService;
  let prisma: PrismaService;

  const mockCharacter = {
    id: 1,
    userId: 1,
    name: 'Тестовый Воин',
    class: 'warrior',
    level: 1,
    experience: 0,
    freePoints: 0,
    superPoints: 0,
    strength: 15,
    agility: 8,
    intelligence: 5,
    maxHp: 150,
    currentHp: 150,
    armor: 0,
    gold: 0,
    stamina: 100,
    rating: 0,
    lastStaminaUpdate: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterLevelUpService,
        {
          provide: PrismaService,
          useValue: {
            character: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CharacterLevelUpService>(CharacterLevelUpService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRequiredExp', () => {
    it('should calculate correct exp for level 1', () => {
      expect(service.calculateRequiredExp(1)).toBe(100);
    });

    it('should calculate correct exp for level 5', () => {
      expect(service.calculateRequiredExp(5)).toBe(2500);
    });

    it('should calculate correct exp for level 10', () => {
      expect(service.calculateRequiredExp(10)).toBe(10000);
    });
  });

  describe('checkAndLevelUp - SuperPoints accrual', () => {
    it('should NOT grant superPoints at level 19', async () => {
      // Требуется 100 * 18^2 = 32400 опыта для достижения 19 уровня
      const char = { ...mockCharacter, level: 18, experience: 33000, superPoints: 0 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      // Проверяем что update был вызван
      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // На уровне 19 не должно быть superPoints
      expect(updateCall.data.level).toBe(19);
      expect(updateCall.data.superPoints).toBe(0);
    });

    it('should grant 1 superPoint at level 20', async () => {
      // Требуется 100 * 19^2 = 36100 опыта для достижения 20 уровня
      const char = { ...mockCharacter, level: 19, experience: 37000, superPoints: 0 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // На уровне 20 должен быть 1 superPoint
      expect(updateCall.data.level).toBe(20);
      expect(updateCall.data.superPoints).toBe(1);
    });

    it('should NOT grant superPoints at level 21', async () => {
      // Требуется 100 * 20^2 = 40000 опыта для достижения 21 уровня
      const char = { ...mockCharacter, level: 20, experience: 41000, superPoints: 1 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // На уровне 21 superPoints не должны измениться
      expect(updateCall.data.level).toBe(21);
      expect(updateCall.data.superPoints).toBe(1); // Остался 1, не добавился
    });

    it('should NOT grant superPoints at level 24', async () => {
      // Требуется 100 * 23^2 = 52900 опыта для достижения 24 уровня
      const char = { ...mockCharacter, level: 23, experience: 53000, superPoints: 1 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // На уровне 24 superPoints не должны измениться
      expect(updateCall.data.level).toBe(24);
      expect(updateCall.data.superPoints).toBe(1);
    });

    it('should grant 1 superPoint at level 25', async () => {
      // Требуется 100 * 24^2 = 57600 опыта для достижения 25 уровня
      const char = { ...mockCharacter, level: 24, experience: 58000, superPoints: 1 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // На уровне 25 должен добавиться 1 superPoint
      expect(updateCall.data.level).toBe(25);
      expect(updateCall.data.superPoints).toBe(2); // Было 1, стало 2
    });

    it('should grant 1 superPoint at level 30', async () => {
      // Требуется 100 * 29^2 = 84100 опыта для достижения 30 уровня
      const char = { ...mockCharacter, level: 29, experience: 85000, superPoints: 2 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // На уровне 30 должен добавиться 1 superPoint
      expect(updateCall.data.level).toBe(30);
      expect(updateCall.data.superPoints).toBe(3); // Было 2, стало 3
    });

    it('should grant 1 superPoint at level 35', async () => {
      // Требуется 100 * 34^2 = 115600 опыта для достижения 35 уровня
      const char = { ...mockCharacter, level: 34, experience: 116000, superPoints: 3 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // На уровне 35 должен добавиться 1 superPoint
      expect(updateCall.data.level).toBe(35);
      expect(updateCall.data.superPoints).toBe(4); // Было 3, стало 4
    });

    it('should grant multiple superPoints when leveling from 19 to 26', async () => {
      // Требуется 100 * 25^2 = 62500 опыта для достижения 26 уровня (с уровня 19)
      // С 19 до 26: получаем superPoints на уровнях 20 и 25 = 2 superPoints
      const char = { ...mockCharacter, level: 19, experience: 63000, superPoints: 0 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockImplementation(async (args: any) => {
        return { ...char, ...args.data };
      });

      await service.checkAndLevelUp(1);

      expect(prisma.character.update).toHaveBeenCalled();
      const updateCall = (prisma.character.update as jest.Mock).mock.calls[0][0];

      // С 19 до 26: получаем superPoints на уровнях 20 и 25 = 2 superPoints
      expect(updateCall.data.superPoints).toBe(2);
    });
  });

  describe('distributeStats', () => {
    it('should distribute stats correctly', async () => {
      const char = { ...mockCharacter, level: 5, freePoints: 12 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);
      jest.spyOn(prisma.character, 'update').mockResolvedValue({
        ...char,
        strength: 19,
        agility: 12,
        intelligence: 6,
        freePoints: 0,
      });

      await service.distributeStats(1, 4, 4, 1);

      expect(prisma.character.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          strength: 19, // 15 + 4
          agility: 12,  // 8 + 4
          intelligence: 6, // 5 + 1
          freePoints: 3,   // 12 - 9
        },
      });
    });

    it('should throw error if not enough free points', async () => {
      const char = { ...mockCharacter, level: 5, freePoints: 3 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);

      await expect(service.distributeStats(1, 5, 5, 5)).rejects.toThrow(
        'Not enough free points',
      );
    });

    it('should throw error if negative stats provided', async () => {
      const char = { ...mockCharacter, level: 5, freePoints: 10 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);

      await expect(service.distributeStats(1, -1, 5, 5)).rejects.toThrow(
        'Stat points cannot be negative',
      );
    });
  });

  describe('getLevelProgress', () => {
    it('should return correct level progress', async () => {
      const char = { ...mockCharacter, level: 5, experience: 1000, freePoints: 3 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);

      const result = await service.getLevelProgress(1);

      expect(result).toEqual({
        currentLevel: 5,
        currentExp: 1000,
        requiredExp: 2500, // 100 * 5^2
        progress: 40, // (1000 / 2500) * 100
        freePoints: 3,
      });
    });

    it('should cap progress at 100%', async () => {
      const char = { ...mockCharacter, level: 5, experience: 3000, freePoints: 3 };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(char);

      const result = await service.getLevelProgress(1);

      expect(result.progress).toBe(100);
    });
  });
});
