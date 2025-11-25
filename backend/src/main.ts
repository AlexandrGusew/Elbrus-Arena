import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOriginsString = configService.get<string>('CORS_ORIGINS', '');
  const corsOrigins = corsOriginsString.split(',').filter(Boolean);

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
