import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Cookie parser для работы с cookies
  app.use(cookieParser());

  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: false, // Выбрасывает ошибку если есть лишние свойства
      transform: true, // Автоматически преобразует типы
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const corsOriginsString = configService.get<string>('CORS_ORIGINS', '');
  const corsOrigins = corsOriginsString.split(',').filter(Boolean);

  // Добавляем localhost для разработки
  const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
  if (isDevelopment) {
    corsOrigins.push('http://localhost:5173', 'http://localhost:3000');
  }

  app.enableCors({
    origin: [
      ...corsOrigins,
      /\.ngrok-free\.dev$/,
      /\.ngrok\.io$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}
bootstrap();
