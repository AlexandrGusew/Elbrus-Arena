import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CharacterModule } from './character/character.module';
import { DungeonModule } from './dungeon/dungeon.module';
import { ItemModule } from './item/item.module';
import { BattleModule } from './battle/battle.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';
import { SpecializationModule } from './specialization/specialization.module';
import { PvpModule } from './pvp/pvp.module';
import { ChatModule } from './chat/chat.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CharacterModule,
    DungeonModule,
    ItemModule,
    BattleModule,
    InventoryModule,
    SpecializationModule,
    PvpModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
