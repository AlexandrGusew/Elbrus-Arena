import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SpecializationBranch } from '@prisma/client';

@Injectable()
export class SpecializationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить доступные ветки для класса
   */
  async getAvailableBranches(characterClass: string): Promise<SpecializationBranch[]> {
    const branchMap: Record<string, SpecializationBranch[]> = {
      WARRIOR: [SpecializationBranch.PALADIN, SpecializationBranch.BARBARIAN],
      ROGUE: [SpecializationBranch.SHADOW_DANCER, SpecializationBranch.POISONER],
      MAGE: [SpecializationBranch.FROST_MAGE, SpecializationBranch.WARLOCK],
    };

    return branchMap[characterClass.toUpperCase()] || [];
  }

  /**
   * Выбрать ветку специализации (один раз, на уровне 10)
   */
  async chooseBranch(characterId: number, branch: SpecializationBranch) {
    // Проверяем, что персонаж существует
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { specialization: true },
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден');
    }

    // Проверяем уровень
    if (character.level < 10) {
      throw new BadRequestException('Требуется уровень 10 для выбора специализации');
    }

    // Проверяем, что еще не выбрана специализация
    if (character.specialization) {
      throw new BadRequestException('Специализация уже выбрана');
    }

    // Проверяем, что ветка подходит для класса
    const availableBranches = await this.getAvailableBranches(character.class);
    if (!availableBranches.includes(branch)) {
      throw new BadRequestException('Эта ветка недоступна для вашего класса');
    }

    // Создаем специализацию
    const specialization = await this.prisma.specialization.create({
      data: {
        characterId,
        branch,
        tier1Unlocked: true,
        tier2Unlocked: false,
        tier3Unlocked: false,
      },
    });

    // Автоматически даем offhand предмет для Tier 1
    await this.grantTier1Item(characterId, branch);

    return specialization;
  }

  /**
   * Выдает и экипирует Tier 1 предмет в зависимости от специализации
   */
  private async grantTier1Item(characterId: number, branch: SpecializationBranch) {
    // Определяем какой предмет выдать
    let itemName: string | null = null;

    switch (branch) {
      case SpecializationBranch.PALADIN:
        itemName = 'Деревянный щит';
        break;
      case SpecializationBranch.POISONER:
        itemName = 'Базовый яд';
        break;
      case SpecializationBranch.FROST_MAGE:
        itemName = 'Водный элементаль';
        break;
      case SpecializationBranch.WARLOCK:
        itemName = 'Бес';
        break;
      // BARBARIAN - не нужен предмет, просто разблокирован слот для второго оружия
      // SHADOW_DANCER - будет реализовано позже (механика 5 зон атаки)
      default:
        return; // Не выдаем предмет
    }

    if (!itemName) return;

    // Находим предмет
    const item = await this.prisma.item.findFirst({
      where: { name: itemName },
    });

    if (!item) {
      console.error(`Tier 1 item not found: ${itemName}`);
      return;
    }

    // Находим инвентарь персонажа
    const inventory = await this.prisma.inventory.findUnique({
      where: { characterId },
    });

    if (!inventory) {
      console.error(`Inventory not found for character ${characterId}`);
      return;
    }

    // Добавляем предмет в инвентарь и сразу экипируем
    await this.prisma.inventoryItem.create({
      data: {
        inventoryId: inventory.id,
        itemId: item.id,
        quantity: 1,
        enhancement: 0,
        isEquipped: true, // Автоматически экипируем
      },
    });
  }

  /**
   * Сменить ветку за золото (1000 золота)
   */
  async changeBranch(characterId: number, newBranch: SpecializationBranch) {
    const RESPEC_COST = 1000;

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { specialization: true },
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден');
    }

    if (!character.specialization) {
      throw new BadRequestException('Сначала выберите специализацию');
    }

    if (character.gold < RESPEC_COST) {
      throw new BadRequestException(`Недостаточно золота. Требуется: ${RESPEC_COST}`);
    }

    // Проверяем, что новая ветка подходит для класса
    const availableBranches = await this.getAvailableBranches(character.class);
    if (!availableBranches.includes(newBranch)) {
      throw new BadRequestException('Эта ветка недоступна для вашего класса');
    }

    // Обновляем специализацию и списываем золото
    await this.prisma.character.update({
      where: { id: characterId },
      data: { gold: character.gold - RESPEC_COST },
    });

    return this.prisma.specialization.update({
      where: { characterId },
      data: {
        branch: newBranch,
        tier1Unlocked: true,
        tier2Unlocked: false,
        tier3Unlocked: false,
      },
    });
  }

  /**
   * Разблокировать следующий тир
   */
  async unlockTier(characterId: number) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { specialization: true },
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден');
    }

    if (!character.specialization) {
      throw new BadRequestException('Сначала выберите специализацию');
    }

    const spec = character.specialization;

    // Проверяем уровни для разблокировки тиров
    if (!spec.tier2Unlocked && character.level >= 15) {
      return this.prisma.specialization.update({
        where: { characterId },
        data: { tier2Unlocked: true },
      });
    }

    if (spec.tier2Unlocked && !spec.tier3Unlocked && character.level >= 20) {
      return this.prisma.specialization.update({
        where: { characterId },
        data: { tier3Unlocked: true },
      });
    }

    throw new BadRequestException('Недостаточный уровень для разблокировки следующего тира');
  }

  /**
   * Получить специализацию персонажа
   */
  async getCharacterSpecialization(characterId: number) {
    return this.prisma.specialization.findUnique({
      where: { characterId },
    });
  }

  /**
   * Получить способности ветки
   */
  async getBranchAbilities(branch: SpecializationBranch) {
    return this.prisma.specializationAbility.findMany({
      where: { branch },
      orderBy: { tier: 'asc' },
    });
  }
}
