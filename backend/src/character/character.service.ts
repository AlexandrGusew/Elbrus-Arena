import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import type { CharacterClass, Character } from '../../../shared/types';
import { CHARACTER_INCLUDE, CLASS_STATS } from './character.constants';

@Injectable()
export class CharacterService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async create(telegramId: number, name: string, characterClass: CharacterClass): Promise<Character> {
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(telegramId),
          username: `user_${telegramId}`,
        }
      });
    }

    // Проверяем, сколько персонажей уже у пользователя
    const userCharacters = await this.prisma.character.findMany({
      where: { userId: user.id },
    });

    if (userCharacters.length >= 3) {
      throw new BadRequestException('У пользователя уже есть максимальное количество персонажей (3)');
    }

    // Проверяем, нет ли уже персонажа этого класса
    const existingClass = userCharacters.find(c => c.class.toUpperCase() === characterClass.toUpperCase());
    if (existingClass) {
      throw new BadRequestException(`У пользователя уже есть персонаж класса ${characterClass}`);
    }

    // Проверяем, не существует ли персонаж с таким именем
    const existingCharacterByName = await this.findByName(name);
    if (existingCharacterByName) {
      throw new BadRequestException(`Персонаж с именем "${name}" уже существует`);
    }

    const stats = CLASS_STATS[characterClass];
    if (!stats) {
      throw new BadRequestException(`Unknown class: ${characterClass}`);
    }

    try {
      const character = await this.prisma.$transaction(async (tx) => {
        const newCharacter = await tx.character.create({
          data: {
            userId: user.id,
            name,
            class: characterClass,
            ...stats,
          },
        });

        await tx.inventory.create({
          data: {
            characterId: newCharacter.id,
            size: 20,
          },
        });

        return newCharacter;
      });

      const fullCharacter = await this.findById(character.id);
      if (!fullCharacter) {
        throw new NotFoundException('Failed to load character after creation');
      }
      return fullCharacter;
    } catch (error: any) {
      // Обработка ошибки уникального ограничения
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new BadRequestException(`Персонаж с именем "${name}" уже существует`);
      }
      throw error;
    }
  }

  async findById(id: number): Promise<Character | null> {
    return this.prisma.character.findUnique({
      where: { id },
      include: CHARACTER_INCLUDE,
    }) as Promise<Character | null>;
  }

  async findByUserId(userId: number): Promise<Character[]> {
    return this.prisma.character.findMany({
      where: { userId },
      include: CHARACTER_INCLUDE,
      orderBy: { createdAt: 'asc' },
    }) as unknown as Promise<Character[]>;
  }

  async findFirstByUserId(userId: number): Promise<Character | null> {
    return this.prisma.character.findFirst({
      where: { userId },
      include: CHARACTER_INCLUDE,
      orderBy: { createdAt: 'asc' },
    }) as Promise<Character | null>;
  }

  async findByName(name: string): Promise<Character | null> {
    return this.prisma.character.findFirst({
      where: { name },
      include: CHARACTER_INCLUDE,
    }) as Promise<Character | null>;
  }

  async equipItem(characterId: number, inventoryItemId: number): Promise<Character> {
    await this.inventoryService.equipItem(characterId, inventoryItemId);
    return this.findById(characterId) as Promise<Character>;
  }

  async unequipItem(characterId: number, inventoryItemId: number): Promise<Character> {
    await this.inventoryService.unequipItem(inventoryItemId);
    return this.findById(characterId) as Promise<Character>;
  }

  async autoCreateCharactersForUser(userId: number): Promise<Character[]> {
    // Проверить, есть ли уже персонажи у пользователя
    const existingCharacters = await this.prisma.character.findMany({
      where: { userId },
      select: { class: true },
    });

    const existingClasses = existingCharacters.map(c => c.class.toUpperCase());
    const allClasses: CharacterClass[] = ['warrior', 'mage', 'rogue'];
    const classesToCreate = allClasses.filter(cls => {
      const classUpper = cls.toUpperCase();
      return !existingClasses.includes(classUpper);
    });

    if (classesToCreate.length === 0) {
      // Все персонажи уже созданы
      return this.findByUserId(userId);
    }

    // Получаем пользователя для telegramId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден`);
    }

    // Создаем недостающих персонажей
    await Promise.all(
      classesToCreate.map(async (classType) => {
        const defaultName = this.getDefaultNameForClass(classType);
        try {
          await this.create(Number(user.telegramId), defaultName, classType);
        } catch (error: any) {
          // Игнорируем ошибку, если персонаж уже существует (на случай параллельного создания)
          if (!error.message?.includes('уже существует')) {
            throw error;
          }
        }
      })
    );

    return this.findByUserId(userId);
  }

  private getDefaultNameForClass(classType: CharacterClass): string {
    const classNames: Record<CharacterClass, string> = {
      warrior: 'Воин',
      mage: 'Маг',
      rogue: 'Разбойник',
    };
    const timestamp = Date.now();
    return `${classNames[classType]}${timestamp}`;
  }

  async updateName(characterId: number, newName: string): Promise<Character> {
    // Проверить уникальность имени
    const existing = await this.prisma.character.findUnique({
      where: { name: newName },
    });

    if (existing && existing.id !== characterId) {
      throw new BadRequestException(`Персонаж с именем "${newName}" уже существует`);
    }

    return this.prisma.character.update({
      where: { id: characterId },
      data: { name: newName },
      include: CHARACTER_INCLUDE,
    }) as unknown as Promise<Character>;
  }
}