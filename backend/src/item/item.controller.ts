import { Controller, Get, Param } from '@nestjs/common';
import { ItemService } from './item.service';
import { Public } from '../auth/public.decorator';
import type { Item } from '../../../shared/types';

@Public()
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