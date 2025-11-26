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

    // Проверка что это не зелье
    if (inventoryItem.item.type === 'potion') {
      throw new BadRequestException('Cannot enhance potions');
    }

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

    if (inventoryItem.item.type === 'potion') {
      throw new BadRequestException('Potions cannot be enhanced');
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
}