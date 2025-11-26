import { Module, forwardRef } from '@nestjs/common';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { CharacterLevelUpService } from './character-levelup.service';
import { CharacterStaminaService } from './character-stamina.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [PrismaModule, forwardRef(() => InventoryModule)],
  controllers: [CharacterController],
  providers: [CharacterService, CharacterLevelUpService, CharacterStaminaService],
  exports: [CharacterService, CharacterLevelUpService, CharacterStaminaService],
})
export class CharacterModule {}