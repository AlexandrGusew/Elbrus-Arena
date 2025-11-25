import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    });

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { isEquipped: false },
    });
  }
}
