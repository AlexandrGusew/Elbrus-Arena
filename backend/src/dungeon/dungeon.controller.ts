import { Controller, Get, Param } from '@nestjs/common';
import { DungeonService } from './dungeon.service';
import type { DungeonWithMonsters } from '../../../shared/types';

@Controller('dungeons')
export class DungeonController {
  constructor(private dungeonService: DungeonService) {}

  @Get()
  async findAll(): Promise<DungeonWithMonsters[]> {
    return this.dungeonService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<DungeonWithMonsters | null> {
    return this.dungeonService.findById(Number(id));
  }
}