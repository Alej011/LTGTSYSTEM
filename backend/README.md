# LTGT System — Backend

API REST en **NestJS 10 + Prisma 5 + PostgreSQL 16**. Todas las rutas usan el prefijo `/api`. Documentación interactiva en `/api/docs` (Swagger).

## Estructura

```
src/
├── main.ts              # Arranque: CORS, ValidationPipe global, prefijo /api, Swagger
├── app.module.ts        # Registro de módulos
├── prisma/              # PrismaService (cliente de BD)
├── common/
│   ├── guards/          # JwtAuthGuard, RolesGuard
│   └── decorators/      # @Roles(...), @User()
├── auth/                # Login, registro, /me, estrategia JWT
├── users/               # CRUD de usuarios (solo ADMIN)
├── products/            # CRUD de productos + DTOs de paginación/filtros
├── brands/              # Lectura de marcas
└── categories/          # Lectura de categorías
prisma/
├── schema.prisma        # Modelo de datos
└── migrations/          # Historial de migraciones (no editar las ya aplicadas)
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
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Usuario admin que crea el seed | — |
| `SUPPORT_EMAIL` / `SUPPORT_PASSWORD` / `SUPPORT_NAME` | Usuario de soporte que crea el seed | — |

## Desarrollo local

Con Docker (recomendado) basta con `docker compose up -d` desde la raíz. Sin Docker:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:deploy      # aplica migraciones (requiere PostgreSQL accesible)
pnpm start:dev          # http://localhost:4000/api
```

| Script | Qué hace |
|---|---|
| `start:dev` | Servidor con recarga automática |
| `build` / `start` | Compila a `dist/` / arranca |
| `prisma:generate` | Regenera el cliente de Prisma tras cambiar el schema |
| `prisma:migrate` | Crea y aplica una migración nueva (solo desarrollo) |
| `prisma:deploy` | Aplica migraciones pendientes (CI / producción) |
| `db:seed` | Crea los usuarios iniciales — ⚠️ `prisma/seed.ts` no existe aún (solo `seed.ts.backup`) |

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
docker compose exec backend pnpm prisma migrate dev --name agregar_campo_x
# 3. Revisa el SQL generado antes de commitear (busca DROP TABLE / DROP COLUMN)
```

Para **renombrar** tablas o columnas, usa `--create-only` y cambia el `DROP` + `CREATE` generado por un `ALTER ... RENAME`, para no perder datos.

## Autenticación y roles

- `POST /api/auth/login` devuelve un JWT (expira en 15 min) con `sub`, `role`, `email` y `name`.
- Las rutas protegidas usan `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN', ...)` y esperan el header `Authorization: Bearer <token>`.

## Endpoints

| Método | Ruta | Roles |
|---|---|---|
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/register` | ADMIN |
| GET | `/api/auth/me` | Autenticado |
| GET | `/api/users/list` | ADMIN |
| POST | `/api/users/create` | ADMIN |
| GET | `/api/users/getById/:id` | ADMIN |
| PATCH | `/api/users/update/:id` | ADMIN |
| GET | `/api/products/list` | ADMIN, SUPPORT — filtros y paginación (`page`, `limit`, …) |
| GET | `/api/products/detail/:id` | ADMIN, SUPPORT |
| POST | `/api/products/create` | ADMIN |
| PATCH | `/api/products/update/:id` | ADMIN |
| DELETE | `/api/products/delete/:id` | ADMIN |
| GET | `/api/brands`, `/api/brands/:id` | ADMIN, SUPPORT |
| GET | `/api/categories`, `/api/categories/:id` | ADMIN, SUPPORT |

El detalle de cada cuerpo y respuesta está en Swagger (`/api/docs`).
