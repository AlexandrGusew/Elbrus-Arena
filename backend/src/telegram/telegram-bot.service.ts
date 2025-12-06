import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

interface AuthAttempt {
  telegramUsername: string;
  code: string | null;
  telegramId: number | null;
  expiresAt: Date;
}

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: Telegraf;
  private authAttempts: Map<string, AuthAttempt> = new Map(); // telegramUsername -> данные
  private isEnabled = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN не настроен в .env. Telegram бот будет отключен.');
      this.isEnabled = false;
      return;
    }
    this.bot = new Telegraf(token);
    this.isEnabled = true;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async onModuleInit() {
    if (!this.isEnabled || !this.bot) {
      console.log('ℹ️  Telegram бот отключен (TELEGRAM_BOT_TOKEN не настроен)');
      return;
    }

    // Обработчик команды /start
    this.bot.command('start', async (ctx: Context) => {
      const telegramId = ctx.from?.id;
      const telegramUsername = ctx.from?.username;
      const firstName = ctx.from?.first_name;

      if (!telegramId || !telegramUsername) {
        return ctx.reply('Не удалось получить ваш Telegram username');
      }

      try {
        console.log(`📨 /start от пользователя @${telegramUsername} (ID: ${telegramId})`);

        // Показываем приветствие с кнопкой
        await ctx.reply(
          `🎮 Добро пожаловать в Nightfall Arena!\n\n` +
          `Привет, ${firstName || telegramUsername}!\n\n` +
          `Используйте кнопку ниже для получения кода аутентификации 👇`,
          {
            reply_markup: {
              keyboard: [
                [{ text: '🔐 Запросить код аутентификации' }]
              ],
              resize_keyboard: true,
              one_time_keyboard: false
            }
          }
        );
      } catch (error) {
        console.error('Ошибка при обработке /start:', error);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
      }
    });

    // Обработчик кнопки "Запросить код аутентификации"
    this.bot.hears('🔐 Запросить код аутентификации', async (ctx: Context) => {
      const telegramId = ctx.from?.id;
      const telegramUsername = ctx.from?.username;
      const firstName = ctx.from?.first_name;

      if (!telegramId || !telegramUsername) {
        return ctx.reply('Не удалось получить ваш Telegram username');
      }

      try {
        console.log(`🔐 Запрос кода от @${telegramUsername} (ID: ${telegramId})`);

        // Ищем попытку авторизации по username
        const attempt = this.authAttempts.get(telegramUsername);

        if (!attempt) {
          return ctx.reply(
            '❌ Попытка авторизации не найдена.\n\n' +
            'Пожалуйста, сначала введите свой Telegram логин на сайте и нажмите "Открыть бота".',
            {
              reply_markup: {
                keyboard: [
                  [{ text: '🔐 Запросить код аутентификации' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: false
              }
            }
          );
        }

        // Генерируем код для входа
        const code = this.generateCode();

        // Обновляем попытку: добавляем код и telegramId
        attempt.code = code;
        attempt.telegramId = telegramId;
        this.authAttempts.set(telegramUsername, attempt);

        // Создаем/обновляем пользователя в БД
        let user = await this.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramId) },
        });

        if (!user) {
          user = await this.prisma.user.create({
            data: {
              telegramId: BigInt(telegramId),
              telegramUsername: telegramUsername,
              firstName: firstName || null,
            },
          });
          console.log(`✨ Новый пользователь зарегистрирован: @${telegramUsername}`);
        } else {
          if (user.telegramUsername !== telegramUsername) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { telegramUsername },
            });
          }
        }

        // Отправляем код
        await ctx.reply(
          `🔐 Ваш код для входа в Nightfall Arena:\n\n` +
          `<b>${code}</b>\n\n` +
          `⏱ Код действителен 5 минут.\n\n` +
          `Введите этот код на сайте для авторизации.`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [
                [{ text: '🔐 Запросить код аутентификации' }]
              ],
              resize_keyboard: true,
              one_time_keyboard: false
            }
          }
        );

        console.log(`✅ Код ${code} отправлен пользователю @${telegramUsername}`);
      } catch (error) {
        console.error('Ошибка при генерации кода:', error);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
      }
    });

    // Запускаем бота асинхронно (без await, чтобы не блокировать старт сервера)
    this.bot.launch().then(() => {
      console.log('✅ Telegram бот запущен');
    }).catch((err) => {
      console.error('❌ Ошибка запуска Telegram бота:', err);
    });

    // Graceful shutdown
    process.once('SIGINT', () => {
      if (this.bot) {
        this.bot.stop('SIGINT');
      }
    });
    process.once('SIGTERM', () => {
      if (this.bot) {
        this.bot.stop('SIGTERM');
      }
    });
  }

  // Инициализация попытки авторизации (вызывается с фронта)
  initiateAuth(telegramUsername: string): void {
    if (!this.isEnabled) {
      console.warn('⚠️  Попытка инициализации авторизации через Telegram, но бот отключен');
      return;
    }
    // Убираем @ если есть
    const username = telegramUsername.startsWith('@') ? telegramUsername.slice(1) : telegramUsername;

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    this.authAttempts.set(username, {
      telegramUsername: username,
      code: null,
      telegramId: null,
      expiresAt,
    });

    console.log(`🎯 Создана попытка авторизации для @${username}`);
  }

  // Проверка кода (telegramUsername + code)
  verifyCode(telegramUsername: string, code: string): number | null {
    if (!this.isEnabled) {
      console.warn('⚠️  Попытка проверки кода через Telegram, но бот отключен');
      return null;
    }
    // Убираем @ если есть
    const username = telegramUsername.startsWith('@') ? telegramUsername.slice(1) : telegramUsername;

    console.log(`🔍 Проверка кода для @${username}: ${code}`);
    console.log(`📝 Всего попыток в памяти: ${this.authAttempts.size}`);
    console.log(`📋 Все попытки:`, Array.from(this.authAttempts.keys()));

    const attempt = this.authAttempts.get(username);

    if (!attempt) {
      console.log(`❌ Попытка для @${username} не найдена`);
      return null;
    }

    if (!attempt.code) {
      console.log(`❌ Код еще не сгенерирован для @${username}`);
      return null;
    }

    if (attempt.code !== code) {
      console.log(`❌ Неверный код для @${username}. Ожидался: ${attempt.code}, получен: ${code}`);
      return null;
    }

    // Проверяем срок действия
    if (new Date() > attempt.expiresAt) {
      console.log(`⏰ Код для @${username} истёк`);
      this.authAttempts.delete(username);
      return null;
    }

    // Код верный - удаляем попытку и возвращаем telegramId
    this.authAttempts.delete(username);
    console.log(`🎉 Код верный для @${username}! Возвращаем telegramId: ${attempt.telegramId}`);
    return attempt.telegramId;
  }

  // Очистка истекших попыток
  cleanExpiredAttempts(): void {
    const now = new Date();
    for (const [username, attempt] of this.authAttempts.entries()) {
      if (now > attempt.expiresAt) {
        this.authAttempts.delete(username);
      }
    }
  }
}