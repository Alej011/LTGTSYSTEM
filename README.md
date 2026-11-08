# LTGT System

Sistema interno de gestión: productos (con marcas y categorías), usuarios con roles, y —en desarrollo— tickets de soporte, base de conocimiento y comunicaciones.

| Carpeta | Qué es | Stack |
|---|---|---|
| [`backend/`](backend/README.md) | API REST | NestJS 10 · Prisma 5 · PostgreSQL 16 |
| [`frontend/`](frontend/README.md) | Aplicación web + BFF | Next.js 14 (App Router) · React Query · Zod · shadcn/ui |
| `docs/` | Análisis y documentación técnica | — |

```
Navegador ──► Next.js (páginas + rutas /api = BFF) ──► NestJS /api ──► PostgreSQL
```

## Estado de los módulos

| Módulo | Backend | Frontend |
|---|---|---|
| Autenticación (JWT, roles `ADMIN` / `SUPPORT`) | ✅ | ✅ |
| Usuarios | ✅ | ✅ |
| Productos, marcas, categorías | ✅ | ✅ |
| Tickets y comentarios | Solo esquema de BD | Datos de prueba (mock) |
| Base de conocimiento | Solo esquema de BD | Datos de prueba (mock) |
| Comunicaciones | — | Datos de prueba (mock) |

## Arranque rápido (desarrollo con Docker)

Requisitos: Docker y Docker Compose.

```bash
cp backend/.env.template backend/.env          # y completa los valores
cp frontend/.env.template frontend/.env.local
docker compose up -d
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |
| Swagger | http://localhost:4000/api/docs |
| PostgreSQL | `localhost:5432` (usuario/clave/BD: `app` / `app` / `ltgt`) |

Al arrancar, el backend aplica las migraciones pendientes (`prisma migrate deploy`).

> **Permisos:** los contenedores escriben en las carpetas montadas como `root`. Si `dist/`, `.next/` o `prisma/migrations/` quedan bloqueadas, ejecuta:
> `sudo chown -R $USER:$USER backend frontend`

## Desarrollo sin Docker

Ver las instrucciones de cada carpeta: [backend](backend/README.md#desarrollo-local) y [frontend](frontend/README.md#desarrollo-local).

## Producción

`docker-compose.prod.yml` existe pero **todavía no es funcional** (ver `docs/analisis_ltgtsystem.md`, Fase 1 del plan).
