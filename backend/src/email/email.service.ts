import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Настройка транспорта для отправки email
    // В продакшене используйте реальный SMTP сервер
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true для порта 465, false для других
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Генерирует 6-значный код подтверждения
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Отправляет email с кодом подтверждения
   */
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', '"Nightfall Arena" <noreply@nightfall-arena.ru>'),
        to: email,
        subject: 'Код подтверждения - Nightfall Arena',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B0000;">Nightfall Arena</h1>
            <h2>Код подтверждения</h2>
            <p>Ваш код для регистрации в Nightfall Arena:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>Код действителен в течение 10 минут.</p>
            <p style="color: #666; font-size: 12px;">Если вы не регистрировались в Nightfall Arena, просто проигнорируйте это письмо.</p>
          </div>
        `,
        text: `Ваш код подтверждения для Nightfall Arena: ${code}. Код действителен 10 минут.`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Код подтверждения отправлен на ${email}`);
    } catch (error) {
      console.error('❌ Ошибка отправки email:', error);
      // В dev режиме просто логируем код в консоль
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        console.log(`🔑 DEV MODE - Код для ${email}: ${code}`);
      }
      throw new Error('Не удалось отправить email');
    }
  }

  /**
   * Отправляет email для сброса пароля
   */
  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', '"Nightfall Arena" <noreply@nightfall-arena.ru>'),
        to: email,
        subject: 'Сброс пароля - Nightfall Arena',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B0000;">Nightfall Arena</h1>
            <h2>Сброс пароля</h2>
            <p>Вы запросили сброс пароля. Ваш код:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>Код действителен в течение 10 минут.</p>
            <p style="color: #666; font-size: 12px;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
          </div>
        `,
        text: `Ваш код для сброса пароля: ${code}. Код действителен 10 минут.`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Код сброса пароля отправлен на ${email}`);
    } catch (error) {
      console.error('❌ Ошибка отправки email:', error);
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        console.log(`🔑 DEV MODE - Код сброса для ${email}: ${code}`);
      }
      throw new Error('Не удалось отправить email');
    }
  }
}