import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CharacterClass, Character } from '../../../shared/types';

@Injectable()
export class CharacterService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, name: string, characterClass: CharacterClass): Promise<Character> {
    let strength = 0, agility = 0, intelligence = 0, maxHp = 100, currentHp = 100;

    switch (characterClass) {
      case 'warrior':
        strength = 15;
        agility = 8;
        intelligence = 5;
        maxHp = 150;
        currentHp = 150;
        break;
      case 'assassin':
        strength = 8;
        agility = 15;
        intelligence = 8;
        maxHp = 100;
        currentHp = 100;
        break;
      case 'mage':
        strength = 5;
        agility = 10;
        intelligence = 15;
        maxHp = 120;
        currentHp = 120;
        break;
    }

    const character = await this.prisma.character.create({
      data: {
        userId,
        name,
        class: characterClass,
        strength,
        agility,
        intelligence,
        maxHp,
        currentHp,
      },
    });

    await this.prisma.inventory.create({
      data: {
        characterId: character.id,
        size: 20,
      },
    });

    const fullCharacter = await this.findById(character.id);
    if (!fullCharacter) {
      throw new Error('Failed to load character after creation');
    }
    return fullCharacter;
  }

  async findById(id: number): Promise<Character | null> {
    return this.prisma.character.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    }) as Promise<Character | null>;
  }

  async findByUserId(userId: number): Promise<Character | null> {
    return this.prisma.character.findUnique({
      where: { userId },
      include: {
        inventory: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    }) as Promise<Character | null>;
  }
}