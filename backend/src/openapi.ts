import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export const API_PREFIX = 'api';

// Lo usan Swagger UI (main.ts) y el generador de openapi.json, así el contrato publicado es el mismo
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
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
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  return SwaggerModule.createDocument(app, config);
}
