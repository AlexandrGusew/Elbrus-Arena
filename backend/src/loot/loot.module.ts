import { Module } from '@nestjs/common';
import { LootService } from './loot.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LootService],
  exports: [LootService],
})
export class LootModule {}
