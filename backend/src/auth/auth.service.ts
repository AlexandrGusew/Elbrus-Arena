import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateTokens(telegramId: number): Promise<{ accessToken: string; refreshToken: string }> {
    // Находим или создаём пользователя
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { telegramId },
      });
    }

    const payload: JwtPayload = {
      userId: user.id,
      telegramId: Number(user.telegramId),
    };

    // Access token - короткий срок жизни (15 минут)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    // Refresh token - долгий срок жизни (30 дней)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret-change-in-production'),
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret-change-in-production'),
      });

      const newPayload: JwtPayload = {
        userId: payload.userId,
        telegramId: payload.telegramId,
      };

      return this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  async validateUser(telegramId: number) {
    return this.prisma.user.findUnique({
      where: { telegramId },
    });
  }
}
