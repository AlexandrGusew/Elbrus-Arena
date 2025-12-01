import { Controller, Get, Post, Put, Delete, Body, Param, Logger } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterLevelUpService } from './character-levelup.service';
import { CharacterStaminaService } from './character-stamina.service';
import { InventoryEnhancementService } from '../inventory/inventory-enhancement.service';
import { InventoryService } from '../inventory/inventory.service';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateCharacterDto } from './dto/create-character.dto';
import type { Character } from '../../../shared/types';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('character')
export class CharacterController {
  private readonly logger = new Logger(CharacterController.name);

  constructor(
    private characterService: CharacterService,
    private levelUpService: CharacterLevelUpService,
    private staminaService: CharacterStaminaService,
    private enhancementService: InventoryEnhancementService,
    private inventoryService: InventoryService,
  ) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() body: CreateCharacterDto): Promise<Character> {
    try {
      this.logger.log(`Creating character for user ${user.userId}: ${JSON.stringify(body)}`);
      const result = await this.characterService.create(user.userId, body.name, body.class);
      this.logger.log(`Character created successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating character: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('me')
  async getMyCharacter(@CurrentUser() user: JwtPayload): Promise<Character | null> {
    return this.characterService.findByUserId(user.userId);
  }

  @Public()
  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<Character | null> {
    return this.characterService.findByName(name);
  }

  @Public()
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Character | null> {
    return this.characterService.findByUserId(Number(userId));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Character | null> {
    return this.characterService.findById(Number(id));
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

  @Get(':id/level-progress')
  async getLevelProgress(@Param('id') id: string) {
    return this.levelUpService.getLevelProgress(Number(id));
  }

  @Post(':id/distribute-stats')
  async distributeStats(
    @Param('id') id: string,
    @Body() body: { strength: number; agility: number; intelligence: number },
  ): Promise<void> {
    return this.levelUpService.distributeStats(
      Number(id),
      body.strength,
      body.agility,
      body.intelligence,
    );
  }

  @Get(':id/stamina')
  async getStaminaInfo(@Param('id') id: string) {
    return this.staminaService.getStaminaInfo(Number(id));
  }

  @Post(':characterId/enhance/:inventoryItemId')
  async enhanceItem(
    @Param('characterId') characterId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ) {
    return this.enhancementService.enhanceItem(Number(characterId), Number(inventoryItemId));
  }

  @Get('enhancement-info/:inventoryItemId')
  async getEnhancementInfo(@Param('inventoryItemId') inventoryItemId: string) {
    return this.enhancementService.getEnhancementInfo(Number(inventoryItemId));
  }

  @Delete(':characterId/sell/:inventoryItemId')
  async sellItem(
    @Param('characterId') characterId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ) {
    return this.inventoryService.sellItem(Number(characterId), Number(inventoryItemId));
  }

  @Post(':id/test-level-boost')
  async testLevelBoost(@Param('id') id: string) {
    return this.levelUpService.testLevelBoost(Number(id));
  }

  @Post(':id/enhance-offhand')
  async enhanceOffhand(@Param('id') id: string) {
    return this.enhancementService.enhanceOffhandWithSuperPoint(Number(id));
  }
}