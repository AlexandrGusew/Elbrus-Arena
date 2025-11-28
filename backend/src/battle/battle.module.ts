import { Module, forwardRef } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { BattleGateway } from './battle.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { LootModule } from '../loot/loot.module';
import { CharacterModule } from '../character/character.module';

@Module({
  imports: [PrismaModule, LootModule, forwardRef(() => CharacterModule)],
  controllers: [BattleController],
  providers: [BattleService, BattleGateway],
  exports: [BattleService],
})
export class BattleModule {}