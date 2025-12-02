import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';
import * as bcrypt from 'bcrypt';
import { validateTelegramInitData, parseTelegramInitData } from './telegram.util';
import { TelegramBotService } from '../telegram/telegram-bot.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private telegramBotService: TelegramBotService,
  ) {}

  /**
   * TELEGRAM АВТОРИЗАЦИЯ - через Telegram WebApp
   */
  async loginWithTelegram(initData: string): Promise<{ accessToken: string; refreshToken: string }> {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      throw new BadRequestException('Telegram authentication is not available');
    }

    // Валидируем подпись от Telegram
    const isValid = validateTelegramInitData(initData, botToken);

    if (!isValid) {
      throw new UnauthorizedException('Неверная подпись Telegram данных');
    }

    // Извлекаем данные пользователя
    const userData = parseTelegramInitData(initData);

    if (!userData) {
      throw new BadRequestException('Не удалось извлечь данные пользователя');
    }

    // Находим или создаём пользователя
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(userData.telegramId) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(userData.telegramId),
          username: userData.username,
          firstName: userData.firstName,
        },
      });
    }

    return this.generateTokens(user.id, Number(user.telegramId));
  }

  /**
   * РЕГИСТРАЦИЯ - простая с логином и паролем
   */
  async register(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Проверяем, не занят ли username
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Имя пользователя уже занято');
    }

    // Валидация
    if (username.length < 3) {
      throw new BadRequestException('Логин должен быть минимум 3 символа');
    }

    if (password.length < 6) {
      throw new BadRequestException('Пароль должен быть минимум 6 символов');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user.id, null);
  }

  /**
   * ВХОД - классическая авторизация
   */
  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return this.generateTokens(user.id, user.telegramId ? Number(user.telegramId) : null);
  }

  /**
   * Генерация JWT токенов
   */
  private async generateTokens(userId: number, telegramId: number | null): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      userId,
      telegramId,
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
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(telegramId: number) {
    return this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
  }

  /**
   * ИНИЦИАЦИЯ АВТОРИЗАЦИИ ЧЕРЕЗ TELEGRAM
   */
  async initiateTelegramAuth(telegramUsername: string): Promise<void> {
    if (!telegramUsername || telegramUsername.length < 2) {
      throw new BadRequestException('Telegram username обязателен');
    }

    this.telegramBotService.initiateAuth(telegramUsername);
  }

  /**
   * АВТОРИЗАЦИЯ ЧЕРЕЗ КОД ИЗ TELEGRAM
   */
  async loginWithTelegramCode(
    telegramUsername: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Проверяем код и получаем telegramId
    const telegramId = this.telegramBotService.verifyCode(telegramUsername, code);

    if (!telegramId) {
      throw new UnauthorizedException('Неверный или истекший код');
    }

    // Находим пользователя по telegramId
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.generateTokens(user.id, telegramId);
  }
}
