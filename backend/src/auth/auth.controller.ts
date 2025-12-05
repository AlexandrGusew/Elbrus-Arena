import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * TELEGRAM АВТОРИЗАЦИЯ через WebApp
   * POST /api/auth/telegram
   * Body: { initData: string }
   */
  @Public()
  @Post('telegram')
  async loginWithTelegram(
    @Body() body: { initData: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.loginWithTelegram(body.initData);

    // Refresh token отправляем в httpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    return { accessToken };
  }

  /**
   * РЕГИСТРАЦИЯ - простая с логином и паролем
   * POST /api/auth/register
   * Body: { username: string, password: string }
   */
  @Public()
  @Post('register')
  async register(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(body.username, body.password);

    // Refresh token отправляем в httpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    return { accessToken };
  }

  /**
   * ВХОД - классическая авторизация
   * POST /api/auth/login
   * Body: { username: string, password: string }
   */
  @Public()
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(body.username, body.password);

      // Refresh token отправляем в httpOnly cookie
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
      });

      return { accessToken };
    } catch (error) {
      // Логируем ошибку для отладки
      console.error('Login error:', error);
      throw error; // Пробрасываем дальше для обработки NestJS exception filters
    }
  }

  /**
   * ОБНОВЛЕНИЕ ТОКЕНА
   * POST /api/auth/refresh
   */
  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const newAccessToken = await this.authService.refreshAccessToken(refreshToken);

    return { accessToken: newAccessToken };
  }

  /**
   * ВЫХОД
   * POST /api/auth/logout
   */
  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  /**
   * ИНИЦИАЦИЯ АВТОРИЗАЦИИ ЧЕРЕЗ TELEGRAM
   * POST /api/auth/telegram/initiate
   * Body: { telegramUsername: string }
   */
  @Public()
  @Post('telegram/initiate')
  async initiateTelegramAuth(@Body() body: { telegramUsername: string }) {
    await this.authService.initiateTelegramAuth(body.telegramUsername);
    return { success: true, message: 'Теперь откройте Telegram бота и напишите /start' };
  }

  /**
   * АВТОРИЗАЦИЯ ЧЕРЕЗ КОД ИЗ TELEGRAM
   * POST /api/auth/telegram/verify-code
   * Body: { telegramUsername: string, code: string }
   */
  @Public()
  @Post('telegram/verify-code')
  async verifyTelegramCode(
    @Body() body: { telegramUsername: string; code: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.loginWithTelegramCode(
      body.telegramUsername,
      body.code,
    );

    // Refresh token отправляем в httpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    return { accessToken };
  }
}
