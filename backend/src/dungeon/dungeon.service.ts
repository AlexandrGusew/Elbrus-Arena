import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { DungeonWithMonsters } from '../../../shared/types';

@Injectable()
export class DungeonService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<DungeonWithMonsters[]> {
    return this.prisma.dungeon.findMany({
      include: {
        monsters: {
          include: {
            monster: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    }) as Promise<DungeonWithMonsters[]>;
  }

  async findById(id: number): Promise<DungeonWithMonsters | null> {
    return this.prisma.dungeon.findUnique({
      where: { id },
      include: {
        monsters: {
          include: {
            monster: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    }) as Promise<DungeonWithMonsters | null>;
  }
}