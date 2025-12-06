import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryEnhancementService {
  private readonly ENHANCEMENT_COST_BASE = 100;
  private readonly ENHANCEMENT_SUCCESS_RATE = 0.2; // 20%
  private readonly ENHANCEMENT_STAT_BONUS = 0.1; // +10% за уровень

  constructor(private prisma: PrismaService) {}

  /**
   * Рассчитать стоимость заточки в зависимости от текущего уровня
   * Формула: 100 * (currentLevel + 1)²
   */
  private calculateEnhancementCost(currentEnhancement: number): number {
    return this.ENHANCEMENT_COST_BASE * Math.pow(currentEnhancement + 1, 2);
  }

  /**
   * Попытка заточить предмет
   * Стоимость: 100 * (currentLevel + 1)² голда
   * Шанс успеха: 20%
   * При успехе: enhancement +1
   * При неудаче: ничего не теряется
   */
  async enhanceItem(characterId: number, inventoryItemId: number): Promise<{
    success: boolean;
    newEnhancementLevel: number;
    goldSpent: number;
  }> {
    // Получаем персонажа с инвентарем
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        inventory: {
          include: {
            items: {
              where: { id: inventoryItemId },
              include: { item: true },
            },
          },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    if (!character.inventory || character.inventory.items.length === 0) {
      throw new NotFoundException('Inventory item not found');
    }

    const inventoryItem = character.inventory.items[0];

    // Рассчитываем стоимость на основе текущего уровня заточки
    const enhancementCost = this.calculateEnhancementCost(inventoryItem.enhancement);

    // Проверка золота
    if (character.gold < enhancementCost) {
      throw new BadRequestException(
        `Недостаточно золота. Требуется: ${enhancementCost}, доступно: ${character.gold}`,
      );
    }

    // Снимаем золото
    await this.prisma.character.update({
      where: { id: characterId },
      data: { gold: character.gold - enhancementCost },
    });

    // Рандом для успеха заточки
    const success = Math.random() < this.ENHANCEMENT_SUCCESS_RATE;

    let newEnhancementLevel = inventoryItem.enhancement;

    if (success) {
      newEnhancementLevel = inventoryItem.enhancement + 1;

      await this.prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { enhancement: newEnhancementLevel },
      });
    }

    return {
      success,
      newEnhancementLevel,
      goldSpent: enhancementCost,
    };
  }

  /**
   * Улучшить предмет с помощью свитка заточки
   * Стоимость: 1 свиток (удаляется из инвентаря)
   * Шанс успеха: 100% (гарантированно)
   * При успехе: enhancement +1
   */
  async enhanceItemWithScroll(
    characterId: number,
    inventoryItemId: number,
    scrollItemId: number,
  ): Promise<{
    success: boolean;
    newEnhancementLevel: number;
    itemName: string;
    scrollName: string;
  }> {
    // Получаем персонажа с инвентарем
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        inventory: {
          include: {
            items: {
              include: { item: true },
            },
          },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    if (!character.inventory) {
      throw new NotFoundException('Inventory not found');
    }

    // Находим предмет для улучшения
    const targetInventoryItem = character.inventory.items.find((i) => i.id === inventoryItemId);
    if (!targetInventoryItem) {
      throw new NotFoundException('Target item not found in inventory');
    }

    // Находим свиток
    const scrollInventoryItem = character.inventory.items.find((i) => i.id === scrollItemId);
    if (!scrollInventoryItem) {
      throw new NotFoundException('Scroll not found in inventory');
    }

    // Проверяем что это действительно свиток
    if (scrollInventoryItem.item.type !== 'scroll') {
      throw new BadRequestException('Selected item is not a scroll');
    }

    // Проверка что это не свиток
    if (targetInventoryItem.item.type === 'scroll') {
      throw new BadRequestException('Cannot enhance scrolls');
    }

    // Валидация соответствия свитка и типа предмета
    const scrollName = scrollInventoryItem.item.name.toLowerCase();
    const itemType = targetInventoryItem.item.type.toLowerCase();

    // Свиток заточки оружия - только для weapon
    if (scrollName.includes('оружия')) {
      if (itemType !== 'weapon') {
        throw new BadRequestException('Свиток заточки оружия можно использовать только на оружие');
      }
    }
    // Свиток заточки брони - для helmet, armor, legs
    else if (scrollName.includes('брони')) {
      if (!['helmet', 'armor', 'legs'].includes(itemType)) {
        throw new BadRequestException(
          'Свиток заточки брони можно использовать только на шлем, доспех или сапоги',
        );
      }
    }
    // Свиток заточки аксессуаров - для belt, accessory
    else if (scrollName.includes('аксессуаров')) {
      if (!['belt', 'accessory'].includes(itemType)) {
        throw new BadRequestException(
          'Свиток заточки аксессуаров можно использовать только на пояс или кольцо',
        );
      }
    } else {
      throw new BadRequestException('Unknown scroll type');
    }

    // Выполняем улучшение и удаление свитка в транзакции
    const newEnhancementLevel = targetInventoryItem.enhancement + 1;

    await this.prisma.$transaction([
      // Увеличиваем enhancement предмета
      this.prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { enhancement: newEnhancementLevel },
      }),
      // Удаляем свиток из инвентаря
      this.prisma.inventoryItem.delete({
        where: { id: scrollItemId },
      }),
    ]);

    return {
      success: true,
      newEnhancementLevel,
      itemName: targetInventoryItem.item.name,
      scrollName: scrollInventoryItem.item.name,
    };
  }

  /**
   * Получить информацию о заточке предмета
   */
  async getEnhancementInfo(inventoryItemId: number): Promise<{
    currentEnhancement: number;
    enhancementCost: number;
    successRate: number;
    statBonus: number; // Процент бонуса к статам (10% * enhancement)
  }> {
    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { item: true },
    });

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    const statBonus = inventoryItem.enhancement * this.ENHANCEMENT_STAT_BONUS;
    const enhancementCost = this.calculateEnhancementCost(inventoryItem.enhancement);

    return {
      currentEnhancement: inventoryItem.enhancement,
      enhancementCost,
      successRate: this.ENHANCEMENT_SUCCESS_RATE,
      statBonus,
    };
  }

  /**
   * Прокачать offhand предмет за super point (Классовый наставник)
   * Стоимость: 1 super point
   * Бонусы зависят от класса и специализации:
   * - ROGUE/POISONER: +20% урон к яду
   * - MAGE (Elemental/Demon): +20% урон к питомцу
   * - WARRIOR/PALADIN (щит): +20% к броне щита
   * - WARRIOR/BARBARIAN (оружие): +20% к урону оружия
   */
  async enhanceOffhandWithSuperPoint(characterId: number): Promise<{
    newEnhancementLevel: number;
    itemName: string;
    bonusType: string;
    bonusValue: number;
  }> {
    // Получаем персонажа с инвентарем и специализацией
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        specialization: true,
        inventory: {
          include: {
            items: {
              where: { isEquipped: true },
              include: { item: true },
            },
          },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    // Проверка наличия super points
    if (character.superPoints < 1) {
      throw new BadRequestException('Недостаточно супер-поинтов. Требуется: 1');
    }

    // Проверка наличия специализации
    if (!character.specialization) {
      throw new BadRequestException('У персонажа нет специализации');
    }

    // Находим экипированный offhand предмет
    const offhandItem = character.inventory!.items.find(
      (invItem) => invItem.item.type === 'offhand' || invItem.item.type === 'shield'
    );

    if (!offhandItem) {
      throw new BadRequestException('У персонажа нет экипированного offhand предмета');
    }

    // Определяем тип улучшения в зависимости от класса и предмета
    let bonusType = 'enhancement';
    let bonusValue = 1;
    const updates: any = {};

    const isPoison = offhandItem.item.name.toLowerCase().includes('яд');
    const isPet =
      offhandItem.item.name.toLowerCase().includes('элементаль') ||
      offhandItem.item.name.toLowerCase().includes('бес');
    const isShield = offhandItem.item.type === 'shield';
    const isWeapon = offhandItem.item.type === 'offhand' && offhandItem.item.damage > 0;

    // ROGUE + яд: ×2 урон
    if (character.class.toUpperCase() === 'ROGUE' && isPoison) {
      const currentDamage = offhandItem.item.damage;
      const newDamage = currentDamage * 2; // Удваиваем урон

      await this.prisma.item.update({
        where: { id: offhandItem.item.id },
        data: { damage: newDamage },
      });

      bonusType = 'урон (яд)';
      bonusValue = currentDamage; // Показываем прирост
    }
    // MAGE + питомец: ×2 урон
    else if (character.class.toUpperCase() === 'MAGE' && isPet) {
      const currentDamage = offhandItem.item.damage;
      const newDamage = currentDamage * 2; // Удваиваем урон

      await this.prisma.item.update({
        where: { id: offhandItem.item.id },
        data: { damage: newDamage },
      });

      bonusType = 'урон (питомец)';
      bonusValue = currentDamage; // Показываем прирост
    }
    // WARRIOR + щит: ×2 броня
    else if (character.class.toUpperCase() === 'WARRIOR' && isShield) {
      const currentArmor = offhandItem.item.armor;
      const newArmor = currentArmor * 2; // Удваиваем броню

      await this.prisma.item.update({
        where: { id: offhandItem.item.id },
        data: { armor: newArmor },
      });

      bonusType = 'броня (щит)';
      bonusValue = currentArmor; // Показываем прирост
    }
    // WARRIOR + оружие: ×2 урон
    else if (character.class.toUpperCase() === 'WARRIOR' && isWeapon) {
      const currentDamage = offhandItem.item.damage;
      const newDamage = currentDamage * 2; // Удваиваем урон

      await this.prisma.item.update({
        where: { id: offhandItem.item.id },
        data: { damage: newDamage },
      });

      bonusType = 'урон (оружие)';
      bonusValue = currentDamage; // Показываем прирост
    }
    // Fallback: просто enhancement +1
    else {
      updates.enhancement = offhandItem.enhancement + 1;
      bonusType = 'enhancement';
      bonusValue = 1;
    }

    // Выполняем прокачку в транзакции
    const transactionOperations: any[] = [];

    // Обновляем enhancement если нужно
    if (Object.keys(updates).length > 0) {
      transactionOperations.push(
        this.prisma.inventoryItem.update({
          where: { id: offhandItem.id },
          data: updates,
        })
      );
    }

    // Снимаем super point
    transactionOperations.push(
      this.prisma.character.update({
        where: { id: characterId },
        data: { superPoints: character.superPoints - 1 },
      })
    );

    await this.prisma.$transaction(transactionOperations);

    return {
      newEnhancementLevel: offhandItem.enhancement + (updates.enhancement ? 1 : 0),
      itemName: offhandItem.item.name,
      bonusType,
      bonusValue,
    };
  }
}