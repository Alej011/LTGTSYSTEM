# LTGT System — Frontend

Aplicación web en **Next.js 16 (App Router) + React 19** con React Query, Zod 4 y componentes shadcn/ui (Tailwind 4). Requiere Node 20.9 o superior (las imágenes Docker usan Node 24).

## Cómo fluyen los datos

```
Componente ──► hook del dominio (features/<dominio>/<dominio>.client.ts, React Query)
           ──► api-client (shared/api/api-client.ts)
           ──► ruta BFF de Next (app/api/**/route.ts)   valida la respuesta con Zod y adapta los datos
           ──► API NestJS (http://backend:4000/api)
```

- **BFF (Backend for Frontend):** las rutas de `app/api/` reenvían cada petición al backend, que valida la entrada con sus DTOs. El BFF valida la respuesta con Zod y la reenvía con la forma del backend.
- **Contrato:** los tipos del backend se generan desde `backend/openapi.json` en `shared/api/schema.d.ts` (`pnpm openapi`); no se escriben a mano. Cada schema Zod de respuesta se declara con `matchesContract<ApiSchemas['XDto']>()` (`shared/api/contract.ts`): si el backend agrega, quita o cambia un campo, el frontend deja de compilar.
- **Roles:** un solo vocabulario, el del backend (`ADMIN`, `SUPPORT`). En pantalla se muestran con `ROLE_LABELS` o `roleLabel` de `shared/roles.ts`.
- **Sesión en el servidor (`shared/session/session.server.ts`):** es el único módulo que conoce las cookies y el flujo de refresh.
  - Guarda el access token (15 min) y el refresh token (7 días) en las cookies HttpOnly `ltgt_access_token` y `ltgt_refresh_token`, con `SameSite=Lax` y `Secure` en producción. Cada cookie dura lo mismo que su token.
  - El JavaScript del navegador nunca ve los tokens: las rutas BFF piden el token con `getAccessToken()` y añaden `Authorization: Bearer` al llamar al backend.
  - El refresh entra como un adaptador (`RefreshSession`); los tests usan uno falso.
- **Sesión en el cliente (`shared/session/session.client.ts`):** `useSession()` da el usuario actual (o `null`), `useLogin()` y `useLogout()` inician y cierran la sesión, y `loginErrorMessage()` explica cada fallo del login.
- **Proxy (`proxy.ts`):** se ejecuta en cada página protegida y en cada ruta `/api` salvo login y logout.
  - Llama a `resolveSession`, que verifica la firma y la expiración del access token con `jose` (por eso necesita el mismo `JWT_ACCESS_SECRET` que el backend).
  - Si el token expiró y hay refresh token, renueva la sesión de forma transparente y actualiza las cookies en esa misma respuesta, también cuando redirige.
  - Sin sesión válida, redirige al login; con `canOpenPage`, bloquea `/users` a quienes no son admin.
  - Es una protección de interfaz: la autorización real la hace el backend.
- **Sesión expirada:** si el BFF responde `401` (la sesión no se pudo renovar), `api-client.ts` lleva al login conservando la página actual en `?redirect=`.

## Estructura

```
app/
├── page.tsx                 # Login
├── (app)/                   # Secciones con sidebar fijo (el grupo no cambia las URLs)
│   ├── layout.tsx           # Sidebar plegable (botón o Ctrl+B) + menú móvil
│   ├── error.tsx            # Pantalla de error dentro de la app (conserva el sidebar)
│   └── dashboard/ products/ users/ tickets/ knowledge/ communications/
├── api/                     # Rutas BFF: misma ruta que el backend (auth, users, products, brands, categories)
├── error.tsx                # Pantalla de error fuera de la app (login)
├── layout.tsx, providers.tsx # Layout raíz, tema (next-themes) y React Query
├── globals.css              # Tokens del tema
features/                    # Un dominio completo por carpeta
├── products/
│   ├── products.client.ts   # Interfaz para los componentes: hooks de React Query y regla de stock bajo
│   ├── products.schemas.ts  # Zod: respuestas que valida el BFF, atadas al contrato
│   └── components/          # Vista, lista, formulario, detalle y badges
├── users/
│   ├── users.client.ts      # useUsers y useSaveUser
│   ├── users.schemas.ts     # Zod: respuestas que valida el BFF y formularios
│   └── components/          # Vista, lista y formulario
└── dashboard/
    ├── dashboard.data.ts    # Cifras y actividad de los módulos que aún son mock
    └── components/          # Vista, tarjetas (productos vía useStockSummary), actividad y accesos
components/
├── <módulo>/                # Componentes de los módulos que aún no pasan a features/
├── ui/                      # Componentes base de shadcn/ui
└── sidebar.tsx, login-form.tsx, error-fallback.tsx
lib/features/<módulo>/       # Servicios mock de tickets, conocimiento y comunicaciones (pasan a features/ en C.8)
shared/                      # Lo que usan varias features; una feature no importa de otra
├── api/
│   ├── api-client.ts        # Cliente HTTP hacia el BFF (timeout, errores tipados, 401 → login)
│   ├── api-config.ts        # URL del backend y timeout
│   ├── bff.server.ts        # Helper de las rutas BFF: token → Bearer, IP, timeout, validación Zod de la respuesta
│   ├── client-ip.ts         # IP del cliente desde X-Forwarded-For
│   ├── contract.ts          # ApiSchemas, ApiPaths y matchesContract
│   └── schema.d.ts          # Tipos generados desde backend/openapi.json (no editar)
├── session/
│   ├── session.server.ts    # Sesión en el servidor: cookies, verificación del JWT y refresh (solo servidor)
│   └── session.client.ts    # useSession, useLogin, useLogout
├── lib/                     # utils (cn) y tones (clases de badge por significado: info, success, warning...)
├── permissions.ts           # Política única: can(rol, recurso, acción) y canOpenPage; la usan proxy.ts y los layouts
├── use-can.ts               # can() con el rol del usuario actual, para los componentes
├── roles.ts                 # Roles del backend (ADMIN, SUPPORT) y sus nombres en pantalla
└── schemas.ts               # Zod comunes: rol, id, email y contraseña
proxy.ts                     # Protección de rutas y renovación de sesión
test/                        # Utilidades de test: BFF simulado sobre fetch y render con React Query
```

## Tema y estilos

Base: tema **ltgtsystem** de [tweakcn](https://tweakcn.com/themes/cmw8k4lvt000004l3a92a7n1m) (shadcn/ui + Tailwind 4), definido en `app/globals.css`.

- **Modo claro:** neutros del tema (fondo y tarjetas blancas, sidebar gris claro) con el azul `oklch(0.488 0.243 264)` como color principal. Es el mismo azul que el tema usa en el modo oscuro y en las gráficas.
- **Modo oscuro:** el del tema, sin cambios.
- **Tipografía, radios, sombras y espaciado:** los del tema en los dos modos. La fuente es la del sistema, sin descargas.
- **Selector de tema:** en el sidebar, en _Configuración_, con las opciones Claro, Oscuro y Sistema. La elección se guarda en el navegador.

**Reglas para mantenerlo coherente:**

- No uses colores fijos de Tailwind (`text-blue-600`, `bg-red-50`...), porque no cambian con el modo oscuro. Usa los tokens: `primary`, `muted-foreground`, `destructive`, `success`, `warning`, `info`.
- Para badges de estado usa `TONE_CLASSES` de `shared/lib/tones.ts`. Elige el tono por significado (éxito, alerta, error, información), no por color.
- Los colores cumplen contraste AA (4.5:1 en texto). Respecto al tema, en modo claro se oscurecieron un poco el texto secundario y el borde de los inputs (3:1). Si cambias un color, revisa el contraste.

## Estado de los módulos

| Módulo                                                    | Origen de datos                               |
| --------------------------------------------------------- | --------------------------------------------- |
| Login / sesión, Usuarios, Productos (marcas y categorías) | API real vía BFF                              |
| Tickets, Base de conocimiento, Comunicaciones             | **Mock en memoria** — se pierden al recargar  |
| Dashboard                                                 | Totales de productos de la API; el resto mock |

## Agregar una funcionalidad conectada al backend

1. En el backend, el DTO de respuesta y `pnpm openapi`; aquí, `pnpm openapi` para regenerar los tipos.
2. Esquema Zod de la respuesta en `features/<dominio>/<dominio>.schemas.ts`, declarado con `matchesContract<ApiSchemas['XDto']>()`. Los tipos que usan los hooks salen de `ApiSchemas` y `ApiPaths`, no de interfaces propias.
3. Ruta BFF en `app/api/<dominio>/.../route.ts`, con la misma ruta que el backend, usando `proxyToBackend` (o `callBackend` si necesitas manipular la respuesta) de `shared/api/bff.server.ts`. El cuerpo se reenvía con `readJsonBody`, sin reglas propias: las valida el backend. Si la respuesta del backend no cumple el esquema, el BFF responde `502` en lugar de reenviar datos sin validar.
4. Hook en `features/<dominio>/<dominio>.client.ts`: los componentes no conocen URLs ni query keys, y toda falla llega como `ApiClientError`. Las mutaciones invalidan las queries que dependen de ellas.
5. Test del hook contra el BFF simulado de `test/mock-bff.ts`.
6. Si requiere permisos, regístralo en `shared/permissions.ts` y úsalo con `useCan()`; no compares roles en los componentes. `backend/src/permissions.spec.ts` falla si la política no coincide con los `@Roles` del backend.

## Desarrollo local

Con Docker basta con `docker compose up -d` desde la raíz. Sin Docker:

```bash
cp .env.template .env.local
pnpm install
pnpm dev           # http://localhost:3000
```

| Variable                | Descripción                                                                                                                                                                    | Ejemplo                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `API_URL`               | URL del backend NestJS (sin `/api`). Solo la usa el servidor y se lee al arrancar, así que la misma imagen sirve para cualquier entorno. En Docker la define `docker-compose`. | `http://localhost:4000` |
| `JWT_ACCESS_SECRET`     | **El mismo valor** que en el backend. Sin él el proxy no puede verificar la sesión                                                                                             | —                       |
| `SESSION_COOKIE_SECURE` | Cookies solo por HTTPS. Por defecto `true` en producción; ponlo en `false` solo si sirves por HTTP                                                                             | `true`                  |

| Script            | Qué hace                                                            |
| ----------------- | ------------------------------------------------------------------- |
| `dev`             | Servidor de desarrollo                                              |
| `build` / `start` | Build de producción (falla si hay errores de TypeScript) / servirlo |
| `typecheck`       | Revisión de tipos sin compilar                                      |
| `openapi`         | Regenera `shared/api/schema.d.ts` desde `backend/openapi.json`      |

El build genera la salida `standalone` (`.next/standalone/server.js`), que es lo que ejecuta la imagen de producción.
