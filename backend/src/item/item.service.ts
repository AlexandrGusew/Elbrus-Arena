import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Item } from '../../../shared/types';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Item[]> {
    return this.prisma.item.findMany() as Promise<Item[]>;
  }

  async findById(id: number): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { id },
    }) as Promise<Item | null>;
  }
}