import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, type INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

const isProduction = process.env.NODE_ENV === 'production';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('LTGT System API')
    .setDescription('API para sistema de gestión de tickets, productos y base de conocimiento')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Endpoints de gestión de usuarios')
    .addTag('products', 'Endpoints de gestión de productos')
    .addTag('brands', 'Endpoints de gestión de marcas')
    .addTag('categories', 'Endpoints de gestión de categorías')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', description: 'Ingresa tu token JWT', in: 'header' },
      'JWT-auth',
    )
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Swagger UI usa scripts inline, incompatibles con la CSP por defecto; solo se expone fuera de producción.
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter));
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  if (!isProduction) setupSwagger(app);

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  logger.log(`API escuchando en el puerto ${port}`);
  if (!isProduction) logger.log(`Swagger disponible en /api/docs`);
}

bootstrap();
