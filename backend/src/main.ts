import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { API_PREFIX, createOpenApiDocument } from './openapi';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Swagger UI usa scripts inline, incompatibles con la CSP por defecto; solo se expone fuera de producción.
  // El BFF reenvía la IP del cliente en X-Forwarded-For; solo se confía en saltos de redes privadas.
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter));
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();

  if (!isProduction) SwaggerModule.setup('api/docs', app, createOpenApiDocument(app));

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  logger.log(`API escuchando en el puerto ${port}`);
  if (!isProduction) logger.log(`Swagger disponible en /api/docs`);
}

void bootstrap();
