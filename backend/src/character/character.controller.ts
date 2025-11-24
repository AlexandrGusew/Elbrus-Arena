import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CharacterService } from './character.service';
import type { CreateCharacterDto, Character } from '../../../shared/types';

@Controller('character')
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  @Post()
  async create(@Body() body: CreateCharacterDto): Promise<Character> {
    return this.characterService.create(body.userId, body.name, body.class);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Character | null> {
    return this.characterService.findById(Number(id));
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Character | null> {
    return this.characterService.findByUserId(Number(userId));
  }
}