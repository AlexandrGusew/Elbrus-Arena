import { Test, TestingModule } from '@nestjs/testing';
import { SpecializationController } from './specialization.controller';
import { SpecializationService } from './specialization.service';
import { SpecializationBranch } from '@prisma/client';

describe('SpecializationController', () => {
  let controller: SpecializationController;
  let service: SpecializationService;

  const mockSpecialization = {
    id: 1,
    characterId: 1,
    branch: SpecializationBranch.PALADIN,
    tier1Unlocked: true,
    tier2Unlocked: false,
    tier3Unlocked: false,
    selectedAt: new Date(),
  };

  const mockAbilities = [
    {
      id: 1,
      branch: SpecializationBranch.PALADIN,
      tier: 1,
      name: 'Мастерство щита',
      description: 'Открывает слот щита. +10% к броне',
      cooldown: 0,
      effects: { type: 'passive', armorBonus: 10 },
    },
    {
      id: 2,
      branch: SpecializationBranch.PALADIN,
      tier: 2,
      name: 'Божественное благословение',
      description: '+30% к броне на 3 хода',
      cooldown: 5,
      effects: { type: 'buff', armorBonus: 30, duration: 3 },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecializationController],
      providers: [
        {
          provide: SpecializationService,
          useValue: {
            getAvailableBranches: jest.fn(),
            getCharacterSpecialization: jest.fn(),
            getBranchAbilities: jest.fn(),
            chooseBranch: jest.fn(),
            changeBranch: jest.fn(),
            unlockTier: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SpecializationController>(SpecializationController);
    service = module.get<SpecializationService>(SpecializationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableBranches', () => {
    it('должен вернуть доступные ветки для класса', async () => {
      const branches = [SpecializationBranch.PALADIN, SpecializationBranch.BARBARIAN];
      jest.spyOn(service, 'getAvailableBranches').mockResolvedValue(branches);

      const result = await controller.getAvailableBranches('WARRIOR');

      expect(result).toEqual({ branches });
      expect(service.getAvailableBranches).toHaveBeenCalledWith('WARRIOR');
    });

    it('должен вернуть пустой массив для неизвестного класса', async () => {
      jest.spyOn(service, 'getAvailableBranches').mockResolvedValue([]);

      const result = await controller.getAvailableBranches('UNKNOWN');

      expect(result).toEqual({ branches: [] });
      expect(service.getAvailableBranches).toHaveBeenCalledWith('UNKNOWN');
    });

    it('должен вернуть ветки для ROGUE', async () => {
      const branches = [SpecializationBranch.SHADOW_DANCER, SpecializationBranch.POISONER];
      jest.spyOn(service, 'getAvailableBranches').mockResolvedValue(branches);

      const result = await controller.getAvailableBranches('ROGUE');

      expect(result).toEqual({ branches });
      expect(service.getAvailableBranches).toHaveBeenCalledWith('ROGUE');
    });

    it('должен вернуть ветки для MAGE', async () => {
      const branches = [SpecializationBranch.FROST_MAGE, SpecializationBranch.WARLOCK];
      jest.spyOn(service, 'getAvailableBranches').mockResolvedValue(branches);

      const result = await controller.getAvailableBranches('MAGE');

      expect(result).toEqual({ branches });
      expect(service.getAvailableBranches).toHaveBeenCalledWith('MAGE');
    });
  });

  describe('getCharacterSpecialization', () => {
    it('должен вернуть специализацию персонажа', async () => {
      jest.spyOn(service, 'getCharacterSpecialization').mockResolvedValue(mockSpecialization);

      const result = await controller.getCharacterSpecialization(1);

      expect(result).toEqual({ specialization: mockSpecialization });
      expect(service.getCharacterSpecialization).toHaveBeenCalledWith(1);
    });

    it('должен вернуть null если специализация не найдена', async () => {
      jest.spyOn(service, 'getCharacterSpecialization').mockResolvedValue(null);

      const result = await controller.getCharacterSpecialization(999);

      expect(result).toEqual({ specialization: null });
      expect(service.getCharacterSpecialization).toHaveBeenCalledWith(999);
    });

    it('должен корректно обработать ParseIntPipe для characterId', async () => {
      jest.spyOn(service, 'getCharacterSpecialization').mockResolvedValue(mockSpecialization);

      const result = await controller.getCharacterSpecialization(1);

      expect(result).toEqual({ specialization: mockSpecialization });
      expect(service.getCharacterSpecialization).toHaveBeenCalledWith(1);
    });
  });

  describe('getBranchAbilities', () => {
    it('должен вернуть способности для ветки', async () => {
      jest.spyOn(service, 'getBranchAbilities').mockResolvedValue(mockAbilities);

      const result = await controller.getBranchAbilities(SpecializationBranch.PALADIN);

      expect(result).toEqual({ abilities: mockAbilities });
      expect(service.getBranchAbilities).toHaveBeenCalledWith(SpecializationBranch.PALADIN);
    });

    it('должен вернуть пустой массив если способностей нет', async () => {
      jest.spyOn(service, 'getBranchAbilities').mockResolvedValue([]);

      const result = await controller.getBranchAbilities(SpecializationBranch.PALADIN);

      expect(result).toEqual({ abilities: [] });
      expect(service.getBranchAbilities).toHaveBeenCalledWith(SpecializationBranch.PALADIN);
    });

    it('должен обработать все типы веток', async () => {
      const branches = [
        SpecializationBranch.PALADIN,
        SpecializationBranch.BARBARIAN,
        SpecializationBranch.SHADOW_DANCER,
        SpecializationBranch.POISONER,
        SpecializationBranch.FROST_MAGE,
        SpecializationBranch.WARLOCK,
      ];

      for (const branch of branches) {
        jest.spyOn(service, 'getBranchAbilities').mockResolvedValue(mockAbilities);

        const result = await controller.getBranchAbilities(branch);

        expect(result).toEqual({ abilities: mockAbilities });
        expect(service.getBranchAbilities).toHaveBeenCalledWith(branch);
      }
    });
  });

  describe('chooseBranch', () => {
    it('должен выбрать ветку специализации', async () => {
      const body = { characterId: 1, branch: SpecializationBranch.PALADIN };
      jest.spyOn(service, 'chooseBranch').mockResolvedValue(mockSpecialization);

      const result = await controller.chooseBranch(body);

      expect(result).toEqual({ specialization: mockSpecialization });
      expect(service.chooseBranch).toHaveBeenCalledWith(1, SpecializationBranch.PALADIN);
    });

    it('должен корректно передать параметры из body', async () => {
      const body = { characterId: 5, branch: SpecializationBranch.BARBARIAN };
      jest.spyOn(service, 'chooseBranch').mockResolvedValue({
        ...mockSpecialization,
        characterId: 5,
        branch: SpecializationBranch.BARBARIAN,
      });

      await controller.chooseBranch(body);

      expect(service.chooseBranch).toHaveBeenCalledWith(5, SpecializationBranch.BARBARIAN);
    });

    it('должен обработать все типы веток при выборе', async () => {
      const branches = [
        SpecializationBranch.PALADIN,
        SpecializationBranch.BARBARIAN,
        SpecializationBranch.SHADOW_DANCER,
        SpecializationBranch.POISONER,
        SpecializationBranch.FROST_MAGE,
        SpecializationBranch.WARLOCK,
      ];

      for (const branch of branches) {
        const body = { characterId: 1, branch };
        jest.spyOn(service, 'chooseBranch').mockResolvedValue({
          ...mockSpecialization,
          branch,
        });

        const result = await controller.chooseBranch(body);

        expect(result.specialization.branch).toBe(branch);
        expect(service.chooseBranch).toHaveBeenCalledWith(1, branch);
      }
    });
  });

  describe('changeBranch', () => {
    it('должен изменить ветку специализации', async () => {
      const body = { characterId: 1, newBranch: SpecializationBranch.BARBARIAN };
      const changedSpec = { ...mockSpecialization, branch: SpecializationBranch.BARBARIAN };
      jest.spyOn(service, 'changeBranch').mockResolvedValue(changedSpec);

      const result = await controller.changeBranch(body);

      expect(result.specialization).toEqual(changedSpec);
      expect(result.message).toBe('Специализация изменена за 1000 золота');
      expect(service.changeBranch).toHaveBeenCalledWith(1, SpecializationBranch.BARBARIAN);
    });

    it('должен вернуть сообщение о смене специализации', async () => {
      const body = { characterId: 1, newBranch: SpecializationBranch.BARBARIAN };
      jest.spyOn(service, 'changeBranch').mockResolvedValue(mockSpecialization);

      const result = await controller.changeBranch(body);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Специализация изменена за 1000 золота');
    });

    it('должен корректно передать новую ветку в сервис', async () => {
      const body = { characterId: 10, newBranch: SpecializationBranch.FROST_MAGE };
      jest.spyOn(service, 'changeBranch').mockResolvedValue({
        ...mockSpecialization,
        characterId: 10,
        branch: SpecializationBranch.FROST_MAGE,
      });

      await controller.changeBranch(body);

      expect(service.changeBranch).toHaveBeenCalledWith(10, SpecializationBranch.FROST_MAGE);
    });
  });

  describe('unlockTier', () => {
    it('должен разблокировать следующий тир', async () => {
      const body = { characterId: 1 };
      const unlockedSpec = { ...mockSpecialization, tier2Unlocked: true };
      jest.spyOn(service, 'unlockTier').mockResolvedValue(unlockedSpec);

      const result = await controller.unlockTier(body);

      expect(result.specialization).toEqual(unlockedSpec);
      expect(result.message).toBe('Следующий тир разблокирован!');
      expect(service.unlockTier).toHaveBeenCalledWith(1);
    });

    it('должен вернуть сообщение об успешной разблокировке', async () => {
      const body = { characterId: 1 };
      jest.spyOn(service, 'unlockTier').mockResolvedValue(mockSpecialization);

      const result = await controller.unlockTier(body);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Следующий тир разблокирован!');
    });

    it('должен корректно передать characterId в сервис', async () => {
      const body = { characterId: 42 };
      jest.spyOn(service, 'unlockTier').mockResolvedValue(mockSpecialization);

      await controller.unlockTier(body);

      expect(service.unlockTier).toHaveBeenCalledWith(42);
    });

    it('должен обработать разблокировку tier 2', async () => {
      const body = { characterId: 1 };
      const tier2Spec = { ...mockSpecialization, tier2Unlocked: true };
      jest.spyOn(service, 'unlockTier').mockResolvedValue(tier2Spec);

      const result = await controller.unlockTier(body);

      expect(result.specialization.tier2Unlocked).toBe(true);
    });

    it('должен обработать разблокировку tier 3', async () => {
      const body = { characterId: 1 };
      const tier3Spec = {
        ...mockSpecialization,
        tier2Unlocked: true,
        tier3Unlocked: true,
      };
      jest.spyOn(service, 'unlockTier').mockResolvedValue(tier3Spec);

      const result = await controller.unlockTier(body);

      expect(result.specialization.tier3Unlocked).toBe(true);
    });
  });
});
