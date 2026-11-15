import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.setGlobalPrefix('api');

  // ── Swagger ──────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('CloudOps Manager API')
    .setDescription(
      'API de gestion de projets, serveurs et applications cloud. ' +
      'Authentification JWT requise sur toutes les routes sauf /auth/register et /auth/login.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  // ─────────────────────────────────────────────────────────────────────

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
