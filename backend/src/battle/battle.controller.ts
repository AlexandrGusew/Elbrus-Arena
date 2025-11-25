import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { BattleService, Battle } from './battle.service';

@Controller('battle')
export class BattleController {
  constructor(private battleService: BattleService) {}

  @Post('start')
  async startBattle(
    @Body() body: { characterId: number; dungeonId: number },
  ): Promise<Battle> {
    return this.battleService.startBattle(body.characterId, body.dungeonId);
  }

  @Get(':id')
  async getBattle(@Param('id') id: string): Promise<Battle | null> {
    return this.battleService.getBattle(id);
  }
}