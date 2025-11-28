import { Controller, Get } from '@nestjs/common';
import { PvpService } from './pvp.service';

@Controller('pvp')
export class PvpController {
  constructor(private pvpService: PvpService) {}

  @Get('stats')
  getStats() {
    return {
      queueCount: this.pvpService.getQueueCount(),
      activeMatches: this.pvpService.getActiveMatchesCount(),
    };
  }
}
