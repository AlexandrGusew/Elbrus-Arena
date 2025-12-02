import { Controller, Get, Param } from '@nestjs/common';
import { ItemService } from './item.service';
import type { Item } from '../../../shared/types';

@Controller('items')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Get()
  async findAll(): Promise<Item[]> {
    return this.itemService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Item | null> {
    return this.itemService.findById(Number(id));
  }
}