# LTGT System — Frontend

Aplicación web en **Next.js 16 (App Router) + React 19** con React Query, Zod 4 y componentes shadcn/ui (Tailwind 4). Requiere Node 20.9 o superior (las imágenes Docker usan Node 24).

## Cómo fluyen los datos

```
Componente ──► hook de React Query (lib/queries)
           ──► servicio (lib/features/*/*.service.ts)
           ──► ruta BFF de Next (app/api/**/route.ts)   valida con Zod y adapta los datos
           ──► API NestJS (http://backend:4000/api)
```

- **BFF (Backend for Frontend):** las rutas de `app/api/` reenvían cada petición al backend, validan entrada y salida con Zod y traducen el formato (p. ej. roles `ADMIN`/`SUPPORT` del backend ↔ `admin`/`empleado` en el frontend).
- **Token:** tras el login, el JWT se guarda en `localStorage` y en la cookie `ltgt_access_token` (la usa el proxy). El cliente lo envía como `Authorization: Bearer` a las rutas BFF. *Pendiente pasarlo a una cookie HttpOnly (Fase 2 del plan).*
- **Proxy (`proxy.ts`, antes `middleware.ts`):** redirige al login si no hay cookie y bloquea `/users` a quienes no son admin. Es solo una protección de interfaz: la autorización real la hace el backend.

## Estructura

```
app/
├── page.tsx                 # Login
├── dashboard/ products/ users/ tickets/ knowledge/ communications/   # Páginas
├── api/                     # Rutas BFF (auth, users, products, brands, categories)
├── layout.tsx, providers.tsx # Layout raíz y React Query / tema
components/
├── <módulo>/                # Componentes de cada pantalla (lista, formulario, detalle)
├── ui/                      # Componentes base de shadcn/ui
└── sidebar.tsx, login-form.tsx, error-boundary.tsx
contexts/auth-context.tsx    # Usuario actual, login y logout
lib/
├── features/<módulo>/       # Servicios: llaman al BFF (o devuelven datos mock)
├── queries/                 # Hooks de React Query (auth, products)
├── schemas/                 # Esquemas Zod y mapeos backend ↔ frontend
└── shared/
    ├── api-client.ts        # Cliente HTTP (timeout, errores tipados, manejo del token)
    ├── api-config.ts        # URL del backend y endpoints
    ├── permissions.ts       # Matriz de permisos por rol (fuente única)
    ├── error-handler.ts
    └── jwt.ts               # Lectura del payload del JWT (sin verificar firma)
proxy.ts                     # Protección de rutas
```

## Estado de los módulos

| Módulo | Origen de datos |
|---|---|
| Login / sesión, Usuarios, Productos (marcas y categorías) | API real vía BFF |
| Tickets, Base de conocimiento, Comunicaciones | **Mock en memoria** — se pierden al recargar |
| Dashboard | Datos estáticos |

## Agregar una funcionalidad conectada al backend

1. Esquema Zod de petición/respuesta en `lib/schemas/`.
2. Ruta BFF en `app/api/<módulo>/.../route.ts` que reenvía al backend.
3. Endpoint en `lib/shared/api-config.ts` y función en `lib/features/<módulo>/<módulo>.service.ts`.
4. Hook en `lib/queries/<módulo>.queries.ts`.
5. Si requiere permisos, regístralo en `lib/shared/permissions.ts`.

## Desarrollo local

Con Docker basta con `docker compose up -d` desde la raíz. Sin Docker:

```bash
cp .env.template .env.local
pnpm install
pnpm dev           # http://localhost:3000
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `API_URL` | URL del backend NestJS (sin `/api`). Solo la usa el servidor y se lee al arrancar, así que la misma imagen sirve para cualquier entorno. En Docker la define `docker-compose`. | `http://localhost:4000` |

| Script | Qué hace |
|---|---|
| `dev` | Servidor de desarrollo |
| `build` / `start` | Build de producción (falla si hay errores de TypeScript) / servirlo |
| `typecheck` | Revisión de tipos sin compilar |

El build genera la salida `standalone` (`.next/standalone/server.js`), que es lo que ejecuta la imagen de producción.
