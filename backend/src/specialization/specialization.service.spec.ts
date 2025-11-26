import { Test, TestingModule } from '@nestjs/testing';
import { SpecializationService } from './specialization.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SpecializationBranch } from '@prisma/client';

describe('SpecializationService', () => {
  let service: SpecializationService;
  let prisma: PrismaService;

  const mockCharacter = {
    id: 1,
    userId: 1,
    name: 'Тестовый Воин',
    class: 'WARRIOR',
    level: 10,
    experience: 0,
    freePoints: 0,
    strength: 15,
    agility: 8,
    intelligence: 5,
    maxHp: 150,
    currentHp: 150,
    armor: 10,
    gold: 2000,
    stamina: 100,
    lastStaminaUpdate: new Date(),
    rating: 0,
    createdAt: new Date(),
    specialization: null,
  };

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
    {
      id: 3,
      branch: SpecializationBranch.PALADIN,
      tier: 3,
      name: 'Божественный щит',
      description: 'Неуязвимость на 1 ход',
      cooldown: 10,
      effects: { type: 'ultimate', invulnerability: true, duration: 1 },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecializationService,
        {
          provide: PrismaService,
          useValue: {
            character: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            specialization: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
            specializationAbility: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SpecializationService>(SpecializationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableBranches', () => {
    it('должен вернуть 2 ветки для WARRIOR', async () => {
      const branches = await service.getAvailableBranches('WARRIOR');
      expect(branches).toEqual([SpecializationBranch.PALADIN, SpecializationBranch.BARBARIAN]);
    });

    it('должен вернуть 2 ветки для ROGUE', async () => {
      const branches = await service.getAvailableBranches('ROGUE');
      expect(branches).toEqual([SpecializationBranch.SHADOW_DANCER, SpecializationBranch.POISONER]);
    });

    it('должен вернуть 2 ветки для MAGE', async () => {
      const branches = await service.getAvailableBranches('MAGE');
      expect(branches).toEqual([SpecializationBranch.FROST_MAGE, SpecializationBranch.WARLOCK]);
    });

    it('должен вернуть пустой массив для неизвестного класса', async () => {
      const branches = await service.getAvailableBranches('UNKNOWN');
      expect(branches).toEqual([]);
    });

    it('должен быть регистронезависимым', async () => {
      const branches = await service.getAvailableBranches('warrior');
      expect(branches).toEqual([SpecializationBranch.PALADIN, SpecializationBranch.BARBARIAN]);
    });
  });

  describe('chooseBranch', () => {
    it('должен успешно выбрать ветку для персонажа 10 уровня', async () => {
      const characterWithoutSpec = { ...mockCharacter, specialization: null };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithoutSpec);
      jest.spyOn(prisma.specialization, 'create').mockResolvedValue(mockSpecialization);

      const result = await service.chooseBranch(1, SpecializationBranch.PALADIN);

      expect(result).toEqual(mockSpecialization);
      expect(prisma.specialization.create).toHaveBeenCalledWith({
        data: {
          characterId: 1,
          branch: SpecializationBranch.PALADIN,
          tier1Unlocked: true,
          tier2Unlocked: false,
          tier3Unlocked: false,
        },
      });
    });

    it('должен выбросить NotFoundException если персонаж не найден', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      await expect(
        service.chooseBranch(999, SpecializationBranch.PALADIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить BadRequestException если уровень меньше 10', async () => {
      const lowLevelCharacter = { ...mockCharacter, level: 9, specialization: null };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(lowLevelCharacter);

      await expect(
        service.chooseBranch(1, SpecializationBranch.PALADIN),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.chooseBranch(1, SpecializationBranch.PALADIN),
      ).rejects.toThrow('Требуется уровень 10 для выбора специализации');
    });

    it('должен выбросить BadRequestException если специализация уже выбрана', async () => {
      const characterWithSpec = { ...mockCharacter, specialization: mockSpecialization };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithSpec);

      await expect(
        service.chooseBranch(1, SpecializationBranch.PALADIN),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.chooseBranch(1, SpecializationBranch.PALADIN),
      ).rejects.toThrow('Специализация уже выбрана');
    });

    it('должен выбросить BadRequestException если ветка не подходит для класса', async () => {
      const characterWithoutSpec = { ...mockCharacter, specialization: null };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithoutSpec);

      await expect(
        service.chooseBranch(1, SpecializationBranch.FROST_MAGE), // MAGE branch для WARRIOR
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.chooseBranch(1, SpecializationBranch.FROST_MAGE),
      ).rejects.toThrow('Эта ветка недоступна для вашего класса');
    });

    it('должен разрешить Barbarian для Warrior', async () => {
      const characterWithoutSpec = { ...mockCharacter, specialization: null };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithoutSpec);
      jest.spyOn(prisma.specialization, 'create').mockResolvedValue({
        ...mockSpecialization,
        branch: SpecializationBranch.BARBARIAN,
      });

      await service.chooseBranch(1, SpecializationBranch.BARBARIAN);

      expect(prisma.specialization.create).toHaveBeenCalledWith({
        data: {
          characterId: 1,
          branch: SpecializationBranch.BARBARIAN,
          tier1Unlocked: true,
          tier2Unlocked: false,
          tier3Unlocked: false,
        },
      });
    });
  });

  describe('changeBranch', () => {
    it('должен успешно изменить ветку за 1000 золота', async () => {
      const characterWithSpec = { ...mockCharacter, gold: 2000, specialization: mockSpecialization };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithSpec);
      jest.spyOn(prisma.character, 'update').mockResolvedValue({ ...characterWithSpec, gold: 1000 });
      jest.spyOn(prisma.specialization, 'update').mockResolvedValue({
        ...mockSpecialization,
        branch: SpecializationBranch.BARBARIAN,
      });

      const result = await service.changeBranch(1, SpecializationBranch.BARBARIAN);

      expect(prisma.character.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { gold: 1000 },
      });
      expect(prisma.specialization.update).toHaveBeenCalledWith({
        where: { characterId: 1 },
        data: {
          branch: SpecializationBranch.BARBARIAN,
          tier1Unlocked: true,
          tier2Unlocked: false,
          tier3Unlocked: false,
        },
      });
      expect(result.branch).toBe(SpecializationBranch.BARBARIAN);
    });

    it('должен выбросить NotFoundException если персонаж не найден', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      await expect(
        service.changeBranch(999, SpecializationBranch.BARBARIAN),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить BadRequestException если нет специализации', async () => {
      const characterWithoutSpec = { ...mockCharacter, specialization: null };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithoutSpec);

      await expect(
        service.changeBranch(1, SpecializationBranch.BARBARIAN),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changeBranch(1, SpecializationBranch.BARBARIAN),
      ).rejects.toThrow('Сначала выберите специализацию');
    });

    it('должен выбросить BadRequestException если недостаточно золота', async () => {
      const poorCharacter = { ...mockCharacter, gold: 500, specialization: mockSpecialization };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(poorCharacter);

      await expect(
        service.changeBranch(1, SpecializationBranch.BARBARIAN),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changeBranch(1, SpecializationBranch.BARBARIAN),
      ).rejects.toThrow('Недостаточно золота. Требуется: 1000');
    });

    it('должен выбросить BadRequestException если новая ветка не подходит для класса', async () => {
      const characterWithSpec = { ...mockCharacter, gold: 2000, specialization: mockSpecialization };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithSpec);

      await expect(
        service.changeBranch(1, SpecializationBranch.FROST_MAGE), // MAGE branch для WARRIOR
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changeBranch(1, SpecializationBranch.FROST_MAGE),
      ).rejects.toThrow('Эта ветка недоступна для вашего класса');
    });

    it('должен сбросить все тиры при смене ветки', async () => {
      const characterWithMaxTiers = {
        ...mockCharacter,
        gold: 2000,
        level: 25,
        specialization: {
          ...mockSpecialization,
          tier2Unlocked: true,
          tier3Unlocked: true,
        },
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithMaxTiers);
      jest.spyOn(prisma.character, 'update').mockResolvedValue(characterWithMaxTiers);
      jest.spyOn(prisma.specialization, 'update').mockResolvedValue({
        ...mockSpecialization,
        branch: SpecializationBranch.BARBARIAN,
        tier2Unlocked: false,
        tier3Unlocked: false,
      });

      await service.changeBranch(1, SpecializationBranch.BARBARIAN);

      expect(prisma.specialization.update).toHaveBeenCalledWith({
        where: { characterId: 1 },
        data: {
          branch: SpecializationBranch.BARBARIAN,
          tier1Unlocked: true,
          tier2Unlocked: false,
          tier3Unlocked: false,
        },
      });
    });
  });

  describe('unlockTier', () => {
    it('должен разблокировать tier 2 на 15 уровне', async () => {
      const characterLvl15 = {
        ...mockCharacter,
        level: 15,
        specialization: { ...mockSpecialization, tier2Unlocked: false },
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterLvl15);
      jest.spyOn(prisma.specialization, 'update').mockResolvedValue({
        ...mockSpecialization,
        tier2Unlocked: true,
      });

      const result = await service.unlockTier(1);

      expect(prisma.specialization.update).toHaveBeenCalledWith({
        where: { characterId: 1 },
        data: { tier2Unlocked: true },
      });
      expect(result.tier2Unlocked).toBe(true);
    });

    it('должен разблокировать tier 3 на 20 уровне', async () => {
      const characterLvl20 = {
        ...mockCharacter,
        level: 20,
        specialization: {
          ...mockSpecialization,
          tier2Unlocked: true,
          tier3Unlocked: false,
        },
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterLvl20);
      jest.spyOn(prisma.specialization, 'update').mockResolvedValue({
        ...mockSpecialization,
        tier2Unlocked: true,
        tier3Unlocked: true,
      });

      const result = await service.unlockTier(1);

      expect(prisma.specialization.update).toHaveBeenCalledWith({
        where: { characterId: 1 },
        data: { tier3Unlocked: true },
      });
      expect(result.tier3Unlocked).toBe(true);
    });

    it('должен выбросить NotFoundException если персонаж не найден', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);

      await expect(service.unlockTier(999)).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить BadRequestException если нет специализации', async () => {
      const characterWithoutSpec = { ...mockCharacter, specialization: null };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterWithoutSpec);

      await expect(service.unlockTier(1)).rejects.toThrow(BadRequestException);
      await expect(service.unlockTier(1)).rejects.toThrow('Сначала выберите специализацию');
    });

    it('должен выбросить BadRequestException если уровень недостаточен для tier 2', async () => {
      const characterLvl14 = {
        ...mockCharacter,
        level: 14,
        specialization: mockSpecialization,
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterLvl14);

      await expect(service.unlockTier(1)).rejects.toThrow(BadRequestException);
      await expect(service.unlockTier(1)).rejects.toThrow(
        'Недостаточный уровень для разблокировки следующего тира',
      );
    });

    it('должен выбросить BadRequestException если уровень недостаточен для tier 3', async () => {
      const characterLvl19 = {
        ...mockCharacter,
        level: 19,
        specialization: {
          ...mockSpecialization,
          tier2Unlocked: true,
          tier3Unlocked: false,
        },
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterLvl19);

      await expect(service.unlockTier(1)).rejects.toThrow(BadRequestException);
      await expect(service.unlockTier(1)).rejects.toThrow(
        'Недостаточный уровень для разблокировки следующего тира',
      );
    });

    it('должен выбросить BadRequestException если все тиры уже разблокированы', async () => {
      const characterMaxTiers = {
        ...mockCharacter,
        level: 25,
        specialization: {
          ...mockSpecialization,
          tier2Unlocked: true,
          tier3Unlocked: true,
        },
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterMaxTiers);

      await expect(service.unlockTier(1)).rejects.toThrow(BadRequestException);
    });

    it('не должен разблокировать tier 3 если tier 2 не разблокирован', async () => {
      const characterLvl20NoTier2 = {
        ...mockCharacter,
        level: 20,
        specialization: {
          ...mockSpecialization,
          tier2Unlocked: false,
          tier3Unlocked: false,
        },
      };
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(characterLvl20NoTier2);
      jest.spyOn(prisma.specialization, 'update').mockResolvedValue({
        ...mockSpecialization,
        tier2Unlocked: true,
      });

      await service.unlockTier(1);

      expect(prisma.specialization.update).toHaveBeenCalledWith({
        where: { characterId: 1 },
        data: { tier2Unlocked: true },
      });
    });
  });

  describe('getCharacterSpecialization', () => {
    it('должен вернуть специализацию персонажа', async () => {
      jest.spyOn(prisma.specialization, 'findUnique').mockResolvedValue(mockSpecialization);

      const result = await service.getCharacterSpecialization(1);

      expect(result).toEqual(mockSpecialization);
      expect(prisma.specialization.findUnique).toHaveBeenCalledWith({
        where: { characterId: 1 },
      });
    });

    it('должен вернуть null если специализация не найдена', async () => {
      jest.spyOn(prisma.specialization, 'findUnique').mockResolvedValue(null);

      const result = await service.getCharacterSpecialization(999);

      expect(result).toBeNull();
    });
  });

  describe('getBranchAbilities', () => {
    it('должен вернуть все способности ветки, отсортированные по тиру', async () => {
      jest.spyOn(prisma.specializationAbility, 'findMany').mockResolvedValue(mockAbilities);

      const result = await service.getBranchAbilities(SpecializationBranch.PALADIN);

      expect(result).toEqual(mockAbilities);
      expect(prisma.specializationAbility.findMany).toHaveBeenCalledWith({
        where: { branch: SpecializationBranch.PALADIN },
        orderBy: { tier: 'asc' },
      });
    });

    it('должен вернуть пустой массив если способностей нет', async () => {
      jest.spyOn(prisma.specializationAbility, 'findMany').mockResolvedValue([]);

      const result = await service.getBranchAbilities(SpecializationBranch.PALADIN);

      expect(result).toEqual([]);
    });

    it('должен корректно обработать все 6 веток', async () => {
      const branches = [
        SpecializationBranch.PALADIN,
        SpecializationBranch.BARBARIAN,
        SpecializationBranch.SHADOW_DANCER,
        SpecializationBranch.POISONER,
        SpecializationBranch.FROST_MAGE,
        SpecializationBranch.WARLOCK,
      ];

      for (const branch of branches) {
        jest.spyOn(prisma.specializationAbility, 'findMany').mockResolvedValue([]);
        await service.getBranchAbilities(branch);
        expect(prisma.specializationAbility.findMany).toHaveBeenCalledWith({
          where: { branch },
          orderBy: { tier: 'asc' },
        });
      }
    });
  });
});
