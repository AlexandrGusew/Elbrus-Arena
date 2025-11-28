import { Test, TestingModule } from '@nestjs/testing';
import { PvpService } from './pvp.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PvpService', () => {
  let service: PvpService;
  let prisma: PrismaService;

  const mockCharacter1 = {
    id: 1,
    userId: 1,
    name: 'Warrior',
    class: 'WARRIOR',
    level: 5,
    experience: 500,
    strength: 20,
    agility: 10,
    intelligence: 5,
    freePoints: 0,
    maxHp: 200,
    currentHp: 200,
    gold: 100,
    stamina: 100,
    armor: 15,
    rating: 1000,
    specializationId: null,
    createdAt: new Date(),
    inventory: {
      id: 1,
      characterId: 1,
      size: 20,
      items: [],
    },
    specialization: null,
  };

  const mockCharacter2 = {
    id: 2,
    userId: 2,
    name: 'Mage',
    class: 'MAGE',
    level: 5,
    experience: 500,
    strength: 8,
    agility: 12,
    intelligence: 20,
    freePoints: 0,
    maxHp: 150,
    currentHp: 150,
    gold: 100,
    stamina: 100,
    armor: 5,
    rating: 950,
    specializationId: null,
    createdAt: new Date(),
    inventory: {
      id: 2,
      characterId: 2,
      size: 20,
      items: [],
    },
    specialization: null,
  };

  const mockPrismaService = {
    character: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PvpService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PvpService>(PvpService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('joinQueue', () => {
    it('should add player to queue', async () => {
      mockPrismaService.character.findUnique.mockResolvedValue(mockCharacter1);

      const result = await service.joinQueue(1, 'socket1');

      expect(result).toHaveProperty('characterId', 1);
      expect(result).toHaveProperty('socketId', 'socket1');
      expect(result).toHaveProperty('joinedAt');
      expect(service.getQueueCount()).toBe(1);
    });

    it('should not add same player twice', async () => {
      mockPrismaService.character.findUnique.mockResolvedValue(mockCharacter1);

      await service.joinQueue(1, 'socket1');
      const result = await service.joinQueue(1, 'socket1');

      expect(service.getQueueCount()).toBe(1);
    });

    it('should create match when two players in queue', async () => {
      mockPrismaService.character.findUnique
        .mockResolvedValueOnce(mockCharacter1)
        .mockResolvedValueOnce(mockCharacter2);

      await service.joinQueue(1, 'socket1');
      const result = await service.joinQueue(2, 'socket2');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('player1');
      expect(result).toHaveProperty('player2');
      expect(result.player1.characterId).toBe(1);
      expect(result.player2.characterId).toBe(2);
      expect(service.getQueueCount()).toBe(0);
      expect(service.getActiveMatchesCount()).toBe(1);
    });
  });

  describe('leaveQueue', () => {
    it('should remove player from queue', async () => {
      mockPrismaService.character.findUnique.mockResolvedValue(mockCharacter1);

      await service.joinQueue(1, 'socket1');
      const removed = service.leaveQueue(1);

      expect(removed).toBe(true);
      expect(service.getQueueCount()).toBe(0);
    });

    it('should return false if player not in queue', () => {
      const removed = service.leaveQueue(999);

      expect(removed).toBe(false);
    });
  });

  describe('submitActions', () => {
    it('should save player actions', async () => {
      mockPrismaService.character.findUnique
        .mockResolvedValueOnce(mockCharacter1)
        .mockResolvedValueOnce(mockCharacter2);

      await service.joinQueue(1, 'socket1');
      await service.joinQueue(2, 'socket2');

      const result = await service.submitActions(1, ['head', 'body'], ['head', 'body', 'legs']);

      expect(result).toBeDefined();
    });

    it('should process round when both players submit actions', async () => {
      mockPrismaService.character.findUnique
        .mockResolvedValueOnce(mockCharacter1)
        .mockResolvedValueOnce(mockCharacter2)
        .mockResolvedValueOnce(mockCharacter1)
        .mockResolvedValueOnce(mockCharacter2)
        .mockResolvedValueOnce(mockCharacter1)
        .mockResolvedValueOnce(mockCharacter2);

      await service.joinQueue(1, 'socket1');
      await service.joinQueue(2, 'socket2');

      await service.submitActions(1, ['head', 'body'], ['head', 'body', 'legs']);
      const result = await service.submitActions(2, ['head', 'body'], ['head', 'body', 'legs']);

      expect(result).toHaveProperty('roundResult');
      expect(result.roundResult).toHaveProperty('roundNumber');
      expect(result.roundResult).toHaveProperty('player1');
      expect(result.roundResult).toHaveProperty('player2');
    });

    it('should finish match when player hp reaches 0', async () => {
      // Создаём персонажей с очень малым HP
      const weakChar1 = { ...mockCharacter1, maxHp: 1, strength: 100 };
      const weakChar2 = { ...mockCharacter2, maxHp: 1, strength: 100 };

      mockPrismaService.character.findUnique
        .mockResolvedValueOnce(weakChar1)  // createMatch char1
        .mockResolvedValueOnce(weakChar2)  // createMatch char2
        .mockResolvedValueOnce(weakChar1)  // processRound char1
        .mockResolvedValueOnce(weakChar2)  // processRound char2
        .mockResolvedValueOnce(weakChar1)  // processRound char1
        .mockResolvedValueOnce(weakChar2); // processRound char2

      mockPrismaService.character.update.mockResolvedValue({});

      await service.joinQueue(1, 'socket1');
      await service.joinQueue(2, 'socket2');

      // Оба атакуют без защиты, чтобы гарантированно нанести урон
      await service.submitActions(1, ['head', 'body'], []);
      const result = await service.submitActions(2, ['head', 'body'], []);

      expect(result).toHaveProperty('matchFinished', true);
      expect(result).toHaveProperty('winner');
    });

    it('should throw error if player not in match', async () => {
      await expect(
        service.submitActions(999, ['head', 'body'], ['head', 'body', 'legs'])
      ).rejects.toThrow();
    });
  });

  describe('getMatchByCharacterId', () => {
    it('should return match if player in match', async () => {
      mockPrismaService.character.findUnique
        .mockResolvedValueOnce(mockCharacter1)
        .mockResolvedValueOnce(mockCharacter2);

      await service.joinQueue(1, 'socket1');
      await service.joinQueue(2, 'socket2');

      const match = service.getMatchByCharacterId(1);

      expect(match).toBeDefined();
      expect(match.player1.characterId).toBe(1);
    });

    it('should return null if player not in match', () => {
      const match = service.getMatchByCharacterId(999);

      expect(match).toBeNull();
    });
  });

  describe('queue and match stats', () => {
    it('should return correct queue count', async () => {
      mockPrismaService.character.findUnique.mockResolvedValue(mockCharacter1);

      expect(service.getQueueCount()).toBe(0);

      await service.joinQueue(1, 'socket1');
      expect(service.getQueueCount()).toBe(1);
    });

    it('should return correct active matches count', async () => {
      mockPrismaService.character.findUnique
        .mockResolvedValueOnce(mockCharacter1)
        .mockResolvedValueOnce(mockCharacter2);

      expect(service.getActiveMatchesCount()).toBe(0);

      await service.joinQueue(1, 'socket1');
      await service.joinQueue(2, 'socket2');

      expect(service.getActiveMatchesCount()).toBe(1);
    });
  });
});
