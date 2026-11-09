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
- **Sesión:**
  - El BFF guarda el access token (15 min) y el refresh token (7 días) en las cookies HttpOnly `ltgt_access_token` y `ltgt_refresh_token`, con `SameSite=Lax` y `Secure` en producción. Cada cookie dura lo mismo que su token.
  - El JavaScript del navegador nunca ve los tokens: las rutas BFF leen la cookie y añaden `Authorization: Bearer` al llamar al backend.
- **Proxy (`proxy.ts`):** se ejecuta en cada página protegida y en cada ruta `/api` salvo login y logout.
  - Verifica la firma y la expiración del access token con `jose` (por eso necesita el mismo `JWT_ACCESS_SECRET` que el backend).
  - Si el token expiró y hay refresh token, renueva la sesión de forma transparente y actualiza las cookies en esa misma respuesta.
  - Sin sesión válida, redirige al login; bloquea `/users` a quienes no son admin.
  - Es una protección de interfaz: la autorización real la hace el backend.
- **Sesión expirada:** si el BFF responde `401` (la sesión no se pudo renovar), `api-client.ts` lleva al login conservando la página actual en `?redirect=`.

## Estructura

```
app/
├── page.tsx                 # Login
├── (app)/                   # Secciones con sidebar fijo (el grupo no cambia las URLs)
│   ├── layout.tsx           # Sidebar + menú móvil
│   └── dashboard/ products/ users/ tickets/ knowledge/ communications/
├── api/                     # Rutas BFF (auth, users, products, brands, categories)
├── layout.tsx, providers.tsx # Layout raíz, tema (next-themes) y React Query
├── globals.css              # Tokens del tema
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
    ├── api-client.ts        # Cliente HTTP hacia el BFF (timeout, errores tipados, 401 → login)
    ├── api-config.ts        # URL del backend y endpoints
    ├── permissions.ts       # Matriz de permisos por rol (fuente única)
    ├── tones.ts             # Clases de badge por significado (info, success, warning, danger...)
    └── error-handler.ts
lib/server/                  # Solo servidor (import "server-only")
├── backend.ts               # Helper de las rutas BFF: cookie → Bearer, IP, timeout, validación Zod
└── session.ts               # Cookies de sesión, verificación del JWT y refresh
proxy.ts                     # Protección de rutas y renovación de sesión
```

## Tema y estilos

Base: tema **ltgtsystem** de [tweakcn](https://tweakcn.com/themes/cmw8k4lvt000004l3a92a7n1m) (shadcn/ui + Tailwind 4), definido en `app/globals.css`.

- **Modo claro:** colores de marca de LTGT (azul petróleo `#164e63`, naranja `#c2410c`, cian claro).
- **Modo oscuro:** el del tema, sin cambios.
- **Tipografía, radios, sombras y espaciado:** los del tema en los dos modos. La fuente es la del sistema, sin descargas.
- **Selector de tema:** en el sidebar, en *Configuración*, con las opciones Claro, Oscuro y Sistema. La elección se guarda en el navegador.

**Reglas para mantenerlo coherente:**
- No uses colores fijos de Tailwind (`text-blue-600`, `bg-red-50`...), porque no cambian con el modo oscuro. Usa los tokens: `primary`, `muted-foreground`, `destructive`, `success`, `warning`, `info`.
- Para badges de estado usa `TONE_CLASSES` de `lib/shared/tones.ts`. Elige el tono por significado (éxito, alerta, error, información), no por color.
- Los colores del modo claro cumplen contraste AA (4.5:1 en texto). Si cambias un color, revisa el contraste.

## Estado de los módulos

| Módulo | Origen de datos |
|---|---|
| Login / sesión, Usuarios, Productos (marcas y categorías) | API real vía BFF |
| Tickets, Base de conocimiento, Comunicaciones | **Mock en memoria** — se pierden al recargar |
| Dashboard | Datos estáticos |

## Agregar una funcionalidad conectada al backend

1. Esquema Zod de petición/respuesta en `lib/schemas/`.
2. Ruta BFF en `app/api/<módulo>/.../route.ts` con `proxyToBackend` (o `callBackend` si necesitas manipular la respuesta) de `lib/server/backend.ts`. Si la respuesta del backend no cumple el esquema, el BFF responde `502` en lugar de reenviar datos sin validar.
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
| `JWT_ACCESS_SECRET` | **El mismo valor** que en el backend. Sin él el proxy no puede verificar la sesión | — |
| `SESSION_COOKIE_SECURE` | Cookies solo por HTTPS. Por defecto `true` en producción; ponlo en `false` solo si sirves por HTTP | `true` |

| Script | Qué hace |
|---|---|
| `dev` | Servidor de desarrollo |
| `build` / `start` | Build de producción (falla si hay errores de TypeScript) / servirlo |
| `typecheck` | Revisión de tipos sin compilar |

El build genera la salida `standalone` (`.next/standalone/server.js`), que es lo que ejecuta la imagen de producción.
