import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async equipItem(characterId: number, inventoryItemId: number) {
    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { item: true },
    });

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        characterId,
        items: {
          some: { id: inventoryItemId },
        },
      },
    });

    if (!inventory) {
      throw new ForbiddenException('This item does not belong to this character');
    }

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        specialization: true,
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

    if (character.level < inventoryItem.item.minLevel) {
      throw new ForbiddenException(`Level ${inventoryItem.item.minLevel} required`);
    }

    if (character.strength < inventoryItem.item.minStrength) {
      throw new ForbiddenException(`Strength ${inventoryItem.item.minStrength} required`);
    }

    if (character.agility < inventoryItem.item.minAgility) {
      throw new ForbiddenException(`Agility ${inventoryItem.item.minAgility} required`);
    }

    if (character.intelligence < inventoryItem.item.minIntelligence) {
      throw new ForbiddenException(`Intelligence ${inventoryItem.item.minIntelligence} required`);
    }

    const sameTypeItems = character.inventory!.items.filter(
      (item) => item.item.type === inventoryItem.item.type && item.isEquipped
    );

    // Валидация offhand предметов по специализации
    // 1. Если это offhand или shield - всегда проверяем
    // 2. Если это weapon И уже есть экипированное оружие - это попытка экипировать в offhand (dual-wield)
    const isOffhandSlot =
      inventoryItem.item.type === 'offhand' ||
      inventoryItem.item.type === 'shield' ||
      (inventoryItem.item.type === 'weapon' && sameTypeItems.length > 0);

    if (isOffhandSlot) {
      this.validateOffhandEquipment(character, inventoryItem.item);
    }

    for (const item of sameTypeItems) {
      await this.prisma.inventoryItem.update({
        where: { id: item.id },
        data: { isEquipped: false },
      });
    }

    await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { isEquipped: true },
    });
  }

  async unequipItem(inventoryItemId: number) {
    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: {
        item: true,
        inventory: {
          include: {
            character: {
              include: {
                specialization: true,
              },
            },
          },
        },
      },
    });

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    // Валидация: нельзя снимать определенные offhand предметы
    this.validateOffhandUnequip(inventoryItem.inventory.character, inventoryItem.item);

    await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { isEquipped: false },
    });
  }

  /**
   * Валидация экипировки offhand предметов по специализации
   */
  private validateOffhandEquipment(character: any, item: any): void {
    if (!character.specialization) {
      return; // Если нет специализации, нет ограничений
    }

    const branch = character.specialization.branch;

    // PALADIN может экипировать только щиты в offhand
    if (branch === 'PALADIN') {
      if (item.type !== 'shield') {
        throw new ForbiddenException('Паладин может экипировать только щиты в offhand слот');
      }
    }

    // BARBARIAN может экипировать только оружие в offhand
    if (branch === 'BARBARIAN') {
      if (item.type !== 'weapon') {
        throw new ForbiddenException('Варвар может экипировать только оружие в offhand слот');
      }
    }

    // SHADOW_DANCER не имеет ограничений на offhand (может экипировать оружие)
    // POISONER, FROST_MAGE, WARLOCK - их offhand предметы проверяются при снятии
  }

  /**
   * Валидация снятия offhand предметов
   */
  private validateOffhandUnequip(character: any, item: any): void {
    if (!character.specialization) {
      return;
    }

    const branch = character.specialization.branch;

    // POISONER не может снять яд
    if (branch === 'POISONER' && item.type === 'offhand' && item.name.toLowerCase().includes('яд')) {
      throw new ForbiddenException('Отравитель не может снять яд - он является частью специализации');
    }

    // FROST_MAGE не может снять элементаля
    if (branch === 'FROST_MAGE' && item.type === 'offhand' && item.name.toLowerCase().includes('элементал')) {
      throw new ForbiddenException('Ледяной маг не может снять элементаля - он является частью специализации');
    }

    // WARLOCK не может снять беса
    if (branch === 'WARLOCK' && item.type === 'offhand' && item.name.toLowerCase().includes('бес')) {
      throw new ForbiddenException('Чернокнижник не может снять беса - он является частью специализации');
    }
  }

  /**
   * Продать предмет за 50% от базовой стоимости
   */
  async sellItem(characterId: number, inventoryItemId: number): Promise<{
    goldReceived: number;
    itemName: string;
  }> {
    // Получаем предмет с проверкой владения
    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: {
        item: true,
        inventory: {
          include: {
            character: true,
          },
        },
      },
    });

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    // Проверка что предмет принадлежит персонажу
    if (inventoryItem.inventory.characterId !== characterId) {
      throw new ForbiddenException('This item does not belong to this character');
    }

    // Нельзя продавать экипированные предметы
    if (inventoryItem.isEquipped) {
      throw new BadRequestException('Cannot sell equipped items. Unequip first.');
    }

    // Цена продажи = 50% от базовой цены
    const sellPrice = Math.floor(inventoryItem.item.price * 0.5);

    // Удаляем предмет и добавляем золото
    await this.prisma.$transaction([
      this.prisma.inventoryItem.delete({
        where: { id: inventoryItemId },
      }),
      this.prisma.character.update({
        where: { id: characterId },
        data: {
          gold: inventoryItem.inventory.character.gold + sellPrice,
        },
      }),
    ]);

    return {
      goldReceived: sellPrice,
      itemName: inventoryItem.item.name,
    };
  }
}
