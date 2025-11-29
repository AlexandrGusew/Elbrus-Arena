import { Module } from '@nestjs/common';
import { PvpService } from './pvp.service';
import { PvpController } from './pvp.controller';
import { PvpGateway } from './pvp.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PrismaModule, ChatModule],
  controllers: [PvpController],
  providers: [PvpService, PvpGateway],
  exports: [PvpService],
})
export class PvpModule {}
