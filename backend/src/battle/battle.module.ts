import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { BattleGateway } from './battle.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BattleController],
  providers: [BattleService, BattleGateway],
  exports: [BattleService],
})
export class BattleModule {}