import { Test, TestingModule } from '@nestjs/testing';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { CharacterLevelUpService } from './character-levelup.service';
import { CharacterStaminaService } from './character-stamina.service';
import { InventoryEnhancementService } from '../inventory/inventory-enhancement.service';
import { InventoryService } from '../inventory/inventory.service';

describe('CharacterController', () => {
  let controller: CharacterController;
  let characterService: CharacterService;
  let levelUpService: CharacterLevelUpService;
  let staminaService: CharacterStaminaService;
  let enhancementService: InventoryEnhancementService;
  let inventoryService: InventoryService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharacterController],
      providers: [
        {
          provide: CharacterService,
          useValue: {
            create: jest.fn(),
            findByName: jest.fn(),
            findByUserId: jest.fn(),
            findById: jest.fn(),
            equipItem: jest.fn(),
            unequipItem: jest.fn(),
          },
        },
        {
          provide: CharacterLevelUpService,
          useValue: {
            getLevelProgress: jest.fn(),
            distributeStats: jest.fn(),
          },
        },
        {
          provide: CharacterStaminaService,
          useValue: {
            getStaminaInfo: jest.fn(),
          },
        },
        {
          provide: InventoryEnhancementService,
          useValue: {
            enhanceItem: jest.fn(),
            getEnhancementInfo: jest.fn(),
          },
        },
        {
          provide: InventoryService,
          useValue: {
            sellItem: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CharacterController>(CharacterController);
    characterService = module.get<CharacterService>(CharacterService);
    levelUpService = module.get<CharacterLevelUpService>(CharacterLevelUpService);
    staminaService = module.get<CharacterStaminaService>(CharacterStaminaService);
    enhancementService = module.get<InventoryEnhancementService>(InventoryEnhancementService);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('должен создать персонажа', async () => {
      const createDto = {
        telegramId: 123456789,
        name: 'Тестовый Воин',
        class: 'warrior' as const,
      };

      jest.spyOn(characterService, 'create').mockResolvedValue(mockCharacter);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCharacter);
      expect(characterService.create).toHaveBeenCalledWith(
        createDto.telegramId,
        createDto.name,
        createDto.class,
      );
    });
  });

  describe('findByName', () => {
    it('должен найти персонажа по имени', async () => {
      jest.spyOn(characterService, 'findByName').mockResolvedValue(mockCharacter);

      const result = await controller.findByName('Тестовый Воин');

      expect(result).toEqual(mockCharacter);
      expect(characterService.findByName).toHaveBeenCalledWith('Тестовый Воин');
    });

    it('должен вернуть null если персонаж не найден', async () => {
      jest.spyOn(characterService, 'findByName').mockResolvedValue(null);

      const result = await controller.findByName('НесуществующийПерсонаж');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('должен найти персонажа по userId', async () => {
      jest.spyOn(characterService, 'findByUserId').mockResolvedValue(mockCharacter);

      const result = await controller.findByUserId('1');

      expect(result).toEqual(mockCharacter);
      expect(characterService.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('findById', () => {
    it('должен найти персонажа по ID', async () => {
      jest.spyOn(characterService, 'findById').mockResolvedValue(mockCharacter);

      const result = await controller.findById('1');

      expect(result).toEqual(mockCharacter);
      expect(characterService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('equipItem', () => {
    it('должен экипировать предмет', async () => {
      jest.spyOn(characterService, 'equipItem').mockResolvedValue(mockCharacter);

      const result = await controller.equipItem('1', '5');

      expect(result).toEqual(mockCharacter);
      expect(characterService.equipItem).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('unequipItem', () => {
    it('должен снять предмет', async () => {
      jest.spyOn(characterService, 'unequipItem').mockResolvedValue(mockCharacter);

      const result = await controller.unequipItem('1', '5');

      expect(result).toEqual(mockCharacter);
      expect(characterService.unequipItem).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('getLevelProgress', () => {
    it('должен вернуть прогресс уровня', async () => {
      const levelProgress = {
        currentLevel: 1,
        currentExp: 50,
        expForNextLevel: 100,
        freePoints: 3,
      };

      jest.spyOn(levelUpService, 'getLevelProgress').mockResolvedValue(levelProgress);

      const result = await controller.getLevelProgress('1');

      expect(result).toEqual(levelProgress);
      expect(levelUpService.getLevelProgress).toHaveBeenCalledWith(1);
    });
  });

  describe('distributeStats', () => {
    it('должен распределить очки характеристик', async () => {
      const statsDto = {
        strength: 2,
        agility: 1,
        intelligence: 0,
      };

      jest.spyOn(levelUpService, 'distributeStats').mockResolvedValue(undefined);

      await controller.distributeStats('1', statsDto);

      expect(levelUpService.distributeStats).toHaveBeenCalledWith(
        1,
        statsDto.strength,
        statsDto.agility,
        statsDto.intelligence,
      );
    });
  });

  describe('getStaminaInfo', () => {
    it('должен вернуть информацию о выносливости', async () => {
      const staminaInfo = {
        currentStamina: 80,
        maxStamina: 100,
        regenRate: 1,
        lastUpdate: new Date(),
      };

      jest.spyOn(staminaService, 'getStaminaInfo').mockResolvedValue(staminaInfo);

      const result = await controller.getStaminaInfo('1');

      expect(result).toEqual(staminaInfo);
      expect(staminaService.getStaminaInfo).toHaveBeenCalledWith(1);
    });
  });

  describe('enhanceItem', () => {
    it('должен улучшить предмет', async () => {
      const enhanceResult = {
        success: true,
        newEnhancement: 1,
        cost: 100,
      };

      jest.spyOn(enhancementService, 'enhanceItem').mockResolvedValue(enhanceResult);

      const result = await controller.enhanceItem('1', '5');

      expect(result).toEqual(enhanceResult);
      expect(enhancementService.enhanceItem).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('getEnhancementInfo', () => {
    it('должен вернуть информацию об улучшении', async () => {
      const enhancementInfo = {
        currentEnhancement: 2,
        nextEnhancementCost: 400,
        successRate: 80,
      };

      jest.spyOn(enhancementService, 'getEnhancementInfo').mockResolvedValue(enhancementInfo);

      const result = await controller.getEnhancementInfo('5');

      expect(result).toEqual(enhancementInfo);
      expect(enhancementService.getEnhancementInfo).toHaveBeenCalledWith(5);
    });
  });

  describe('sellItem', () => {
    it('должен продать предмет', async () => {
      const sellResult = {
        goldReceived: 50,
        itemName: 'Меч Новичка',
      };

      jest.spyOn(inventoryService, 'sellItem').mockResolvedValue(sellResult);

      const result = await controller.sellItem('1', '5');

      expect(result).toEqual(sellResult);
      expect(inventoryService.sellItem).toHaveBeenCalledWith(1, 5);
    });
  });
});