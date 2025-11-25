import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { CharacterService } from './character.service';
import type { CreateCharacterDto, Character } from '../../../shared/types';

@Controller('character')
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  @Post()
  async create(@Body() body: CreateCharacterDto): Promise<Character> {
    return this.characterService.create(body.telegramId, body.name, body.class);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Character | null> {
    return this.characterService.findById(Number(id));
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Character | null> {
    return this.characterService.findByUserId(Number(userId));
  }

  @Put(':characterId/equip/:inventoryItemId')
  async equipItem(
    @Param('characterId') characterId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ): Promise<Character> {
    return this.characterService.equipItem(Number(characterId), Number(inventoryItemId));
  }

  @Put(':characterId/unequip/:inventoryItemId')
  async unequipItem(
    @Param('characterId') characterId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ): Promise<Character> {
    return this.characterService.unequipItem(Number(characterId), Number(inventoryItemId));
  }
}