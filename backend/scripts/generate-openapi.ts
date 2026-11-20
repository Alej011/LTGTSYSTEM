import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { NestFactory } from '@nestjs/core';

// El documento solo depende de controladores y DTOs; la validación de entorno exige estas variables aunque no se usen
process.env.DATABASE_URL ??= 'postgresql://openapi:openapi@localhost:5432/openapi';
process.env.JWT_ACCESS_SECRET ??= 'openapi-generation-placeholder-secret';

async function generate() {
  const { AppModule } = await import('../src/app.module');
  const { API_PREFIX, createOpenApiDocument } = await import('../src/openapi');

  // preview: arma el grafo de módulos sin instanciar proveedores, así no se conecta a la base
  const app = await NestFactory.create(AppModule, { preview: true, logger: false });
  app.setGlobalPrefix(API_PREFIX);
  const document = createOpenApiDocument(app);
  await app.close();

  const target = join(__dirname, '..', '..', 'openapi.json');
  writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`);
  console.log(`openapi.json actualizado (${Object.keys(document.paths).length} rutas)`);
}

void generate();
