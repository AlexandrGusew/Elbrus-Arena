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
      // Получаем информацию о предмете для проверки типа
      const item = await this.prisma.item.findUnique({
        where: { id: loot.itemId },
      });

      if (!item) {
        console.error(`Item with id ${loot.itemId} not found`);
        continue;
      }

      // Для свитков ищем все записи с enhancement: 0 и объединяем их
      // Для остальных предметов ищем только одну запись с enhancement: 0
      const isStackableItem = item.type === 'scroll';

      if (isStackableItem) {
        // Для свитков: находим ВСЕ записи с enhancement: 0
        const existingItems = await this.prisma.inventoryItem.findMany({
          where: {
            inventoryId: character.inventory.id,
            itemId: loot.itemId,
            isEquipped: false,
            enhancement: 0,
          },
        });

        if (existingItems.length > 0) {
          // Складываем в первую найденную запись
          const firstItem = existingItems[0];
          const totalQuantity = existingItems.reduce((sum, item) => sum + item.quantity, 0) + loot.quantity;

          // Обновляем первую запись с общим количеством
          await this.prisma.inventoryItem.update({
            where: { id: firstItem.id },
            data: { quantity: totalQuantity },
          });

          // Удаляем остальные записи, если они есть
          if (existingItems.length > 1) {
            const idsToDelete = existingItems.slice(1).map(item => item.id);
            await this.prisma.inventoryItem.deleteMany({
              where: {
                id: { in: idsToDelete },
              },
            });
          }
        } else {
          // Создаем новую запись
          await this.prisma.inventoryItem.create({
            data: {
              inventoryId: character.inventory.id,
              itemId: loot.itemId,
              quantity: loot.quantity,
              enhancement: 0,
            },
          });
        }
      } else {
        // Для остальных предметов: ищем только одну запись с enhancement: 0
        const existingItem = await this.prisma.inventoryItem.findFirst({
          where: {
            inventoryId: character.inventory.id,
            itemId: loot.itemId,
            isEquipped: false,
            enhancement: 0,
          },
        });

        if (existingItem) {
          const newQuantity = existingItem.quantity + loot.quantity;
          console.log(`📦 Обновление количества предмета ${item.name} (ID: ${loot.itemId}): ${existingItem.quantity} + ${loot.quantity} = ${newQuantity}`);
          await this.prisma.inventoryItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        } else {
          console.log(`📦 Создание нового предмета ${item.name} (ID: ${loot.itemId}) с количеством ${loot.quantity}`);
          await this.prisma.inventoryItem.create({
            data: {
              inventoryId: character.inventory.id,
              itemId: loot.itemId,
              quantity: loot.quantity,
              enhancement: 0,
            },
          });
        }
      }
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
