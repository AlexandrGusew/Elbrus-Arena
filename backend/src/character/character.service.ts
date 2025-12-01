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

  async create(userId: number, name: string, characterClass: CharacterClass): Promise<Character> {
    // Проверяем есть ли уже персонаж у пользователя
    const existingCharacter = await this.findByUserId(userId);
    if (existingCharacter) {
      return existingCharacter;
    }

    const stats = CLASS_STATS[characterClass];
    if (!stats) {
      throw new BadRequestException(`Unknown class: ${characterClass}`);
    }

    const character = await this.prisma.$transaction(async (tx) => {
      const newCharacter = await tx.character.create({
        data: {
          userId,
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
  }

  async findById(id: number): Promise<Character | null> {
    return this.prisma.character.findUnique({
      where: { id },
      include: CHARACTER_INCLUDE,
    }) as Promise<Character | null>;
  }

  async findByUserId(userId: number): Promise<Character | null> {
    return this.prisma.character.findUnique({
      where: { userId },
      include: CHARACTER_INCLUDE,
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
}