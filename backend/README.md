# LTGT System — Backend

API REST en **NestJS 11 + Prisma 7 + PostgreSQL 16** sobre Node 24 LTS. Todas las rutas usan el prefijo `/api`. Documentación interactiva en `/api/docs` (Swagger, solo fuera de producción).

## Estructura

```
src/
├── main.ts              # Arranque: helmet, CORS, validación y filtro de errores globales, Swagger
├── app.module.ts        # Registro de módulos
├── generated/prisma/    # Cliente de Prisma generado (no se versiona: pnpm prisma:generate)
├── prisma/              # PrismaModule global con PrismaService
├── common/
│   ├── guards/          # JwtAuthGuard, RolesGuard
│   ├── decorators/      # @Roles(...), @User()
│   └── filters/         # Traducción de errores de Prisma a códigos HTTP
├── health/              # GET /api/health (estado de la API y la BD)
├── auth/                # Login (con límite de intentos), registro, /me, estrategia JWT
├── users/               # CRUD de usuarios (solo ADMIN)
├── products/            # CRUD de productos + DTOs de paginación/filtros
├── brands/              # Lectura de marcas
└── categories/          # Lectura de categorías
prisma.config.ts         # Configuración de Prisma: URL de la BD, migraciones y seed
prisma/
├── schema.prisma        # Modelo de datos
├── migrations/          # Historial de migraciones (no editar las ya aplicadas)
├── seed.ts              # Carga usuarios iniciales y catálogo de ejemplo
└── seed-data.ts         # Datos del catálogo: marcas, categorías y productos
```

Cada módulo sigue el patrón `controller` (rutas + Swagger) → `service` (lógica + Prisma) → `dto/` (validación con class-validator).

## Variables de entorno

Copia `.env.template` a `.env`:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL. Usa `db` como host dentro de Docker y `localhost` fuera | `postgresql://app:app@db:5432/ltgt` |
| `JWT_ACCESS_SECRET` | Secreto para firmar tokens (mín. 32 caracteres aleatorios) | `openssl rand -base64 48` |
| `PORT` | Puerto de la API | `4000` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:3000` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Usuario admin que crea el seed. Obligatorio, contraseña de 8+ caracteres | — |
| `SUPPORT_EMAIL` / `SUPPORT_PASSWORD` / `SUPPORT_NAME` | Usuario de soporte que crea el seed. Opcional | — |

## Desarrollo local

El proyecto usa **pnpm 9.15.0** (campo `packageManager` en `package.json`). pnpm 10+ cambia a esa versión automáticamente; con otra versión de pnpm, `node_modules` puede quedar inconsistente.

Con Docker (recomendado) basta con `docker compose up -d` desde la raíz. Sin Docker:

```bash
pnpm install
pnpm prisma:generate    # obligatorio tras clonar o cambiar el schema
pnpm prisma:deploy      # aplica migraciones (requiere PostgreSQL accesible)
pnpm db:seed            # usuarios iniciales y catálogo de ejemplo
pnpm start:dev          # http://localhost:4000/api
```

Desde tu máquina, con la BD de Docker, antepón `DATABASE_URL=postgresql://app:app@localhost:5432/ltgt` a los comandos de Prisma y del seed.

| Script | Qué hace |
|---|---|
| `start:dev` | Servidor con recarga automática |
| `build` / `start` | Compila a `dist/` / arranca |
| `prisma:generate` | Genera el cliente de Prisma en `src/generated/prisma` |
| `prisma:migrate` | Crea y aplica una migración nueva (solo desarrollo) |
| `prisma:deploy` | Aplica migraciones pendientes (CI / producción) |
| `db:seed` | Crea usuarios (desde `.env`), marcas, categorías y 30 productos. Se puede ejecutar varias veces: no duplica ni sobrescribe datos existentes |
| `build:seed` / `db:seed:prod` | Compila el seed a `dist-seed/` / lo ejecuta con Node (usado en la imagen de producción) |

## Base de datos

Todo el esquema está en **inglés**: modelos en PascalCase y tablas en snake_case plural (con `@@map` en el schema). Las columnas usan camelCase, que es la convención de Prisma.

| Modelo | Tabla | Notas |
|---|---|---|
| `User` | `users` | `role`: `ADMIN` \| `SUPPORT` |
| `Ticket` | `tickets` | Estados `OPEN`, `IN_PROGRESS`, `CLOSED` · sin módulo API aún |
| `Comment` | `comments` | Comentarios de un ticket · sin módulo API aún |
| `Knowledge` | `knowledge_articles` | Artículos con tags · sin módulo API aún |
| `Product` | `products` | SKU único, precio `Decimal(10,2)`, estado `active`/`inactive`/`discontinued` |
| `Brand` | `brands` | Un producto pertenece a una marca |
| `Category` | `categories` | Relación N:M con productos vía `product_categories` |

> Al crear un modelo nuevo, agrega `@@map("nombre_en_plural")` para mantener la convención.

### Crear una migración

```bash
# 1. Edita prisma/schema.prisma
# 2. Genera la migración SIEMPRE con nombre descriptivo:
docker compose exec backend pnpm prisma:migrate --name agregar_campo_x
# 3. Regenera el cliente (Prisma 7 ya no lo hace solo):
docker compose exec backend pnpm prisma:generate
# 4. Revisa el SQL generado antes de commitear (busca DROP TABLE / DROP COLUMN)
```

Para **renombrar** tablas o columnas, usa `--create-only` y cambia el `DROP` + `CREATE` generado por un `ALTER ... RENAME`, para no perder datos.

## Autenticación y roles

- `POST /api/auth/login` devuelve un JWT (expira en 15 min) con `sub`, `role`, `email` y `name`.
- Las rutas protegidas usan `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN', ...)` y esperan el header `Authorization: Bearer <token>`.
- El login admite **5 intentos por minuto por email** (luego responde `429`). El límite es por cuenta y no por IP porque todas las peticiones llegan desde el BFF. El contador vive en memoria: con varias instancias del backend habría que usar un almacenamiento compartido (por ejemplo, Redis).

## Errores

| Código | Cuándo |
|---|---|
| `400` | Datos inválidos, campos no permitidos o referencia a un registro inexistente (p. ej. `brandId`) |
| `404` | Registro no encontrado |
| `409` | Valor único duplicado (p. ej. SKU o email) |
| `429` | Demasiados intentos de login |

## Endpoints

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/health` | Público |
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/register` | ADMIN |
| GET | `/api/auth/me` | Autenticado |
| GET | `/api/users/list` | ADMIN |
| POST | `/api/users/create` | ADMIN |
| GET | `/api/users/getById/:id` | ADMIN |
| PATCH | `/api/users/update/:id` | ADMIN |
| GET | `/api/products/list` | ADMIN, SUPPORT — filtros (`search`, `category`, `status`, `brandId`, `maxStock`) y paginación (`page`, `limit` ≤ 100) |
| GET | `/api/products/detail/:id` | ADMIN, SUPPORT |
| POST | `/api/products/create` | ADMIN |
| PATCH | `/api/products/update/:id` | ADMIN |
| DELETE | `/api/products/delete/:id` | ADMIN |
| GET | `/api/brands`, `/api/brands/:id` | ADMIN, SUPPORT |
| GET | `/api/categories`, `/api/categories/:id` | ADMIN, SUPPORT |

El detalle de cada cuerpo y respuesta está en Swagger (`/api/docs`).
