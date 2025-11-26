import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LootedItem {
  itemId: number;
  quantity: number;
}

@Injectable()
export class LootService {
  // ТЕСТОВЫЙ РЕЖИМ: Увеличиваем шанс дропа на 50% для тестирования
  private readonly DROP_CHANCE_MULTIPLIER = 1.5;

  constructor(private prisma: PrismaService) {}

  async generateLoot(monsterId: number): Promise<LootedItem[]> {
    const monsterLoots = await this.prisma.monsterLoot.findMany({
      where: { monsterId },
      include: { item: true },
    });

    const lootedItems: LootedItem[] = [];

    for (const loot of monsterLoots) {
      const roll = Math.random();

      // Увеличиваем шанс на 50% для тестирования (макс 100%)
      const adjustedChance = Math.min(
        loot.dropChance * this.DROP_CHANCE_MULTIPLIER,
        1.0,
      );

      if (roll <= adjustedChance) {
        const quantity = this.randomInt(loot.minCount, loot.maxCount);
        lootedItems.push({
          itemId: loot.itemId,
          quantity,
        });
      }
    }

    return lootedItems;
  }

  async addItemsToInventory(
    characterId: number,
    lootedItems: LootedItem[],
  ): Promise<void> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { inventory: true },
    });

    if (!character || !character.inventory) {
      throw new Error('Character or inventory not found');
    }

    for (const loot of lootedItems) {
      const existingItem = await this.prisma.inventoryItem.findFirst({
        where: {
          inventoryId: character.inventory.id,
          itemId: loot.itemId,
          isEquipped: false,
        },
      });

      if (existingItem) {
        await this.prisma.inventoryItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + loot.quantity },
        });
      } else {
        await this.prisma.inventoryItem.create({
          data: {
            inventoryId: character.inventory.id,
            itemId: loot.itemId,
            quantity: loot.quantity,
          },
        });
      }
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
