import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InventoryService } from './inventory.service';
import { InventoryEnhancementService } from './inventory-enhancement.service';

@Module({
  imports: [PrismaModule],
  providers: [InventoryService, InventoryEnhancementService],
  exports: [InventoryService, InventoryEnhancementService],
})
export class InventoryModule {}
