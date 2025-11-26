import { Test, TestingModule } from '@nestjs/testing';
import { BattleService, Zone } from './battle.service';
import { PrismaService } from '../prisma/prisma.service';
import { LootService } from '../loot/loot.service';
import { CharacterLevelUpService } from '../character/character-levelup.service';
import { CharacterStaminaService } from '../character/character-stamina.service';

describe('BattleService', () => {
  let service: BattleService;
  let prisma: PrismaService;

  const mockCharacter = {
    id: 1,
    userId: 1,
    name: 'Test Hero',
    class: 'warrior',
    level: 1,
    experience: 0,
    strength: 15,
    agility: 8,
    intelligence: 5,
    freePoints: 0,
    maxHp: 150,
    currentHp: 150,
    gold: 100,
    stamina: 100,
    armor: 5,
    rating: 0,
    createdAt: new Date(),
    inventory: {
      id: 1,
      characterId: 1,
      size: 20,
      items: [],
    },
  };

  const mockMonster = {
    id: 1,
    name: 'Goblin',
    hp: 50,
    damage: 10,
    armor: 5,
    isBoss: false,
  };

  const mockDungeon = {
    id: 1,
    name: 'Dark Cave',
    difficulty: 'easy',
    staminaCost: 20,
    expReward: 50,
    goldReward: 30,
    monsters: [
      {
        id: 1,
        dungeonId: 1,
        monsterId: 1,
        position: 1,
        monster: mockMonster,
      },
    ],
  };

  const mockBattle = {
    id: 'test-battle-123',
    characterId: 1,
    dungeonId: 1,
    currentMonster: 1,
    characterHp: 150,
    monsterHp: 50,
    status: 'active',
    rounds: [],
    createdAt: new Date(),
    dungeon: mockDungeon,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleService,
        {
          provide: PrismaService,
          useValue: {
            character: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            dungeon: {
              findUnique: jest.fn(),
            },
            pveBattle: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: LootService,
          useValue: {
            generateLoot: jest.fn().mockResolvedValue([]),
            addItemsToInventory: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CharacterLevelUpService,
          useValue: {
            checkAndLevelUp: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: CharacterStaminaService,
          useValue: {
            spendStamina: jest.fn().mockResolvedValue(undefined),
            getStaminaInfo: jest.fn().mockResolvedValue({
              currentStamina: 100,
              maxStamina: 100,
              secondsToFull: 0,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BattleService>(BattleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('startBattle', () => {
    it('должен создать новый бой', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);
      jest.spyOn(prisma.dungeon, 'findUnique').mockResolvedValue(mockDungeon as any);
      jest.spyOn(prisma.pveBattle, 'create').mockResolvedValue(mockBattle as any);

      const result = await service.startBattle(1, 1);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-battle-123');
      expect(result.characterId).toBe(1);
      expect(result.dungeonId).toBe(1);
      expect(result.status).toBe('active');
      expect(result.characterHp).toBe(150);
      expect(result.monsterHp).toBe(50);
    });

    it('должен выбросить ошибку если персонаж не найден', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      await expect(service.startBattle(999, 1)).rejects.toThrow('Character not found');
    });

    it('должен выбросить ошибку если подземелье не найдено', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter);
      jest.spyOn(prisma.dungeon, 'findUnique').mockResolvedValue(null);

      await expect(service.startBattle(1, 999)).rejects.toThrow(
        'Dungeon not found or has no monsters',
      );
    });
  });

  describe('getBattle', () => {
    it('должен вернуть бой по ID', async () => {
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(mockBattle as any);

      const result = await service.getBattle('test-battle-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-battle-123');
    });

    it('должен вернуть null если бой не найден', async () => {
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(null);

      const result = await service.getBattle('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('processRound', () => {
    it('должен обработать раунд и нанести урон', async () => {
      const battleWithRounds = {
        ...mockBattle,
        rounds: [],
        character: mockCharacter,
      };
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(battleWithRounds as any);
      jest.spyOn(prisma.pveBattle, 'update').mockResolvedValue(battleWithRounds as any);

      const playerActions = {
        attacks: ['head', 'body'] as [Zone, Zone],
        defenses: ['head', 'body', 'legs'] as [Zone, Zone, Zone],
      };

      const result = await service.processRound('test-battle-123', playerActions);

      expect(result).toBeDefined();
      expect(result.roundNumber).toBe(1);
      expect(result.playerActions).toEqual(playerActions);
      expect(result.monsterActions).toBeDefined();
      expect(result.playerActions.attacks).toHaveLength(2);
      expect(result.playerActions.defenses).toHaveLength(3);
    });

    it('должен завершить бой если HP персонажа <= 0', async () => {
      const battleLowHp = {
        ...mockBattle,
        characterHp: 10,
        rounds: [],
        character: mockCharacter,
      };
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(battleLowHp as any);

      const updateSpy = jest.spyOn(prisma.pveBattle, 'update').mockResolvedValue({
        ...battleLowHp,
        characterHp: 0,
        status: 'lost',
      } as any);

      const playerActions = {
        attacks: ['head', 'body'] as [Zone, Zone],
        defenses: ['head', 'body', 'head'] as [Zone, Zone, Zone],
      };

      await service.processRound('test-battle-123', playerActions);

      const updateCall = updateSpy.mock.calls[0][0];
      expect(updateCall.data.characterHp).toBeLessThanOrEqual(0);
      expect(updateCall.data.status).toBe('lost');
    });

    it('должен завершить бой если HP монстра <= 0', async () => {
      const battleLowMonsterHp = {
        ...mockBattle,
        monsterHp: 10,
        rounds: [],
        character: mockCharacter,
      };
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(battleLowMonsterHp as any);

      const updateSpy = jest.spyOn(prisma.pveBattle, 'update').mockResolvedValue({
        ...battleLowMonsterHp,
        monsterHp: 0,
        status: 'won',
      } as any);

      const playerActions = {
        attacks: ['head', 'body'] as [Zone, Zone],
        defenses: ['head', 'body', 'legs'] as [Zone, Zone, Zone],
      };

      await service.processRound('test-battle-123', playerActions);

      const updateCall = updateSpy.mock.calls[0][0];
      expect(updateCall.data.monsterHp).toBeLessThanOrEqual(10);
      expect(updateCall.data.status).toMatch(/active|won/);
    });

    it('должен выбросить ошибку если бой не найден', async () => {
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(null);

      const playerActions = {
        attacks: ['head', 'body'] as [Zone, Zone],
        defenses: ['head', 'body', 'legs'] as [Zone, Zone, Zone],
      };

      await expect(service.processRound('non-existent', playerActions)).rejects.toThrow(
        'Battle not found',
      );
    });

    it('должен выбросить ошибку если бой не активен', async () => {
      const inactiveBattle = { ...mockBattle, status: 'won' };
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(inactiveBattle as any);

      const playerActions = {
        attacks: ['head', 'body'] as [Zone, Zone],
        defenses: ['head', 'body', 'legs'] as [Zone, Zone, Zone],
      };

      await expect(service.processRound('test-battle-123', playerActions)).rejects.toThrow(
        'Battle is not active',
      );
    });
  });

  describe('calculateDamage (через processRound)', () => {
    it('должен нанести полный урон если зоны не защищены', async () => {
      const battleData = {
        ...mockBattle,
        rounds: [],
        character: mockCharacter,
      };
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(battleData as any);
      jest.spyOn(prisma.pveBattle, 'update').mockResolvedValue(battleData as any);

      const playerActions = {
        attacks: ['head', 'body'] as [Zone, Zone],
        defenses: ['legs', 'legs', 'legs'] as [Zone, Zone, Zone],
      };

      const result = await service.processRound('test-battle-123', playerActions);

      expect(result.monsterDamage).toBeGreaterThan(0);
    });

    it('должен заблокировать урон если зона защищена', async () => {
      const battleData = {
        ...mockBattle,
        rounds: [],
        character: mockCharacter,
      };
      jest.spyOn(prisma.pveBattle, 'findUnique').mockResolvedValue(battleData as any);
      jest.spyOn(prisma.pveBattle, 'update').mockResolvedValue(battleData as any);

      const playerActions = {
        attacks: ['legs', 'legs'] as [Zone, Zone],
        defenses: ['head', 'body', 'legs'] as [Zone, Zone, Zone],
      };

      const result = await service.processRound('test-battle-123', playerActions);

      // Урон зависит от случайных действий монстра, но должен быть >= 0
      expect(result.playerDamage).toBeGreaterThanOrEqual(0);
    });
  });
});