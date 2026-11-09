# LTGT System

Sistema interno de gestión: productos (con marcas y categorías), usuarios con roles, y —en desarrollo— tickets de soporte, base de conocimiento y comunicaciones.

| Carpeta | Qué es | Stack |
|---|---|---|
| [`backend/`](backend/README.md) | API REST | NestJS 11 · Prisma 7 · PostgreSQL 16 · Node 24 |
| [`frontend/`](frontend/README.md) | Aplicación web + BFF | Next.js 16 (App Router) · React 19 · React Query · Zod 4 · shadcn/ui |
| `docs/` | Análisis y documentación técnica | — |

```
Navegador ──► Next.js (páginas + rutas /api = BFF) ──► NestJS /api ──► PostgreSQL
```

## Estado de los módulos

| Módulo | Backend | Frontend |
|---|---|---|
| Autenticación (JWT + refresh token en cookies HttpOnly, roles `ADMIN` / `SUPPORT`) | ✅ | ✅ |
| Usuarios | ✅ | ✅ |
| Productos, marcas, categorías | ✅ | ✅ |
| Tickets y comentarios | Solo esquema de BD | Datos de prueba (mock) |
| Base de conocimiento | Solo esquema de BD | Datos de prueba (mock) |
| Comunicaciones | — | Datos de prueba (mock) |

## Arranque rápido (desarrollo con Docker)

Requisitos: Docker y Docker Compose.

```bash
cp backend/.env.template backend/.env          # y completa los valores
cp frontend/.env.template frontend/.env.local  # mismo JWT_ACCESS_SECRET que en backend/.env
docker compose up -d
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |
| Swagger | http://localhost:4000/api/docs |
| PostgreSQL | `localhost:5432` (usuario/clave/BD: `app` / `app` / `ltgt`) |

Si cambian las dependencias (`package.json`), reconstruye con `docker compose up -d --build -V`: `-V` recrea los volúmenes de `node_modules`, que si no conservan las versiones anteriores.

Al arrancar, el backend aplica las migraciones pendientes (`prisma migrate deploy`). Para cargar los usuarios de `backend/.env` y el catálogo de ejemplo:

```bash
docker compose exec backend pnpm db:seed
```

> **Permisos:** los contenedores de desarrollo corren como el usuario `node` (UID 1000), así que los archivos que genera quedan a tu nombre. Si tienes carpetas de root de versiones anteriores, ejecuta una vez:
> `sudo chown -R $USER:$USER backend frontend`

## Desarrollo sin Docker

Ver las instrucciones de cada carpeta: [backend](backend/README.md#desarrollo-local) y [frontend](frontend/README.md#desarrollo-local).

## Producción

```bash
cp .env.template .env                                   # PostgreSQL y JWT_ACCESS_SECRET (compartido por backend y frontend)
cp backend/.env.template backend/.env.production         # FRONTEND_ORIGIN, NODE_ENV=production
docker compose -f docker-compose.prod.yml up -d --build
```

- El backend aplica las migraciones al arrancar y solo es accesible desde la red interna de Docker.
- Para crear el usuario administrador la primera vez:
  `docker compose -f docker-compose.prod.yml exec -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... -e ADMIN_NAME=... backend pnpm db:seed:prod`
- El frontend corre como servidor standalone de Next.js en el puerto 3000 y llega al backend por `http://backend:4000`.
- Las cookies de sesión son `Secure`: sirve el frontend por HTTPS (proxy inverso delante). Para probar por HTTP, define `SESSION_COOKIE_SECURE=false` en el `.env` de la raíz.
