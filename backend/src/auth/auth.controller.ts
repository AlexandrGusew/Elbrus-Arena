import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: { telegramId: number },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.generateTokens(body.telegramId);

    // Refresh token отправляем в httpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // только HTTPS в production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    // Access token отправляем в теле ответа
    return { accessToken };
  }

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

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }
}
