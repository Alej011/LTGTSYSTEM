# Plan de trabajo: arquitectura del frontend, CI/CD y despliegue — LTGTSYSTEM

Objetivos:

- Publicar el sistema en el VPS de Contabo (donde ya corre otra aplicación) con su propio dominio y HTTPS.
- Que todo cambio pase por un pipeline de calidad (CI) antes de entrar a `main` y se despliegue solo (CD), con rollback automático si falla.
- Reorganizar el frontend para que siga la misma lógica modular del backend antes de escribir sus tests.

## 1. Estado actual (evaluación)

| Área | Situación | Impacto en el plan |
|---|---|---|
| Repositorio | Público, rama `main`, sin `.github/`, borrado de ramas tras merge desactivado | Actions, GHCR, rulesets y CodeQL son gratuitos en repos públicos |
| Imágenes Docker | Multi-stage con `runner` para backend y frontend; healthchecks definidos | Se reutilizan tal cual; solo cambia dónde se construyen |
| Frontend sin `NEXT_PUBLIC_*` | Toda la configuración se lee en runtime | Una misma imagen sirve para cualquier entorno |
| `docker-compose.prod.yml` | Construye en el servidor (`build:`) y publica `3000:3000` en todas las interfaces | Debe usar imágenes de GHCR y publicar solo en `127.0.0.1` |
| Migraciones | Se ejecutan al arrancar el backend (`prisma:deploy && node ...`) | Pasan a un paso explícito del despliegue, antes de cambiar contenedores |
| Backend: lint | Existe el script `lint`, pero ESLint no está instalado ni configurado | Hay que instalarlo y configurarlo |
| Backend: tests | Jest instalado, `test/jest-e2e.json` no existe, no hay ningún test | Se crean desde cero |
| Frontend: lint/tests | Solo `typecheck`; sin ESLint, Prettier ni tests; carpeta `cypress/` vacía | Se agregan ESLint, Prettier y Vitest; se elimina `cypress/` |
| Health | `GET /api/health` verifica la base de datos | Sirve para el healthcheck del despliegue |
| Cookies de sesión | `Secure` en producción | HTTPS es obligatorio: sin él el login no funciona |
| Módulos | Tickets, comentarios, conocimiento y comunicaciones siguen siendo mock | Se despliega igual; se irán reemplazando con el flujo ya automatizado |

## 2. Arquitectura en el VPS

```
Internet ──► :443 Caddy (ya instalado, compartido)
               ├── red-social.duckdns.org  ──► app existente (sin cambios)
               └── ltgt.duckdns.org        ──► 127.0.0.1:3100 ──► ltgt_frontend:3000
                                                                   │  (BFF)
                                                     red interna ltgt_net
                                                                   ▼
                                                    ltgt_backend:4000 ──► ltgt_db:5432
```

### IP, dominio y "subredes"

- **No hace falta otra IP ni subredes.** Una sola IPv4 puede servir muchos sitios: Caddy decide a qué aplicación enviar cada petición según el dominio (cabecera `Host` / SNI). Una IP adicional en Contabo tiene costo mensual y no aporta nada aquí. Una IP pública de un VPS no se puede "dividir" en subredes.
- **Dominio:** crear en DuckDNS un subdominio nuevo (por ejemplo `ltgtsystem.duckdns.org`) apuntando a la misma IP. DuckDNS permite hasta 5 subdominios gratis. Alternativa sin crear nada: DuckDNS resuelve cualquier sub-subdominio a la misma IP (`ltgt.<actual>.duckdns.org`), y Caddy le saca certificado igual.
- **SSH:** se sigue entrando por la IP fija; con el nuevo dominio también funcionaría, pero no cambia nada.

### HTTPS

Sí es necesario y **lo cubre el mismo Caddy**: al agregar un bloque para el nuevo dominio, Caddy obtiene y renueva solo el certificado de Let's Encrypt. No se instala un segundo Caddy, porque solo un proceso puede usar los puertos 80 y 443.

```caddyfile
ltgtsystem.duckdns.org {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3100
}
```

Si Caddy corre dentro de Docker en vez de como servicio del sistema, en lugar de `127.0.0.1:3100` se conecta el frontend a una red Docker compartida con Caddy y se usa `reverse_proxy ltgt_frontend:3000`.

Beneficio adicional: Caddy reemplaza el `X-Forwarded-For` que manda el cliente por su IP real (solo confía en proxies declarados en `trusted_proxies`), lo que cierra el problema pendiente de suplantación del límite de login por IP.

### Convivencia con la aplicación existente

- **Puertos:** solo el frontend se publica, y solo en `127.0.0.1:3100` (o el puerto que esté libre). Backend y base de datos no se publican.
- **Firewall:** Docker se salta UFW con los puertos publicados en `0.0.0.0`; publicar en `127.0.0.1` evita exponer el frontend sin HTTPS.
- **Nombres:** proyecto compose `ltgtsystem`, contenedores `ltgt_*`, red y volumen propios. No se toca nada de la red social.
- **Recursos:** límites de memoria por contenedor para que LTGT no afecte a la otra aplicación (referencia: db 512 MB, backend 512 MB, frontend 512 MB).
- **Base de datos:** contenedor Postgres propio, independiente del de la red social.

## 3. Organización en GitHub

### GitHub Project

- Project (tablero) **LTGTSYSTEM** con columnas: `Backlog`, `Todo`, `In progress`, `In review`, `Done`.
- Un **milestone** por fase de este plan y, después, uno por fase funcional.
- Cada tarea es un **issue**; cada PR lo cierra con `Closes #n`, y el workflow del Project lo mueve solo a `Done`.
- Labels por tipo (`feat`, `fix`, `refactor`, `docs`, `ci`, `chore`, `test`) y por área (`backend`, `frontend`, `infra`).
- Crear el Project desde la CLI requiere el scope `project`: `gh auth refresh -s project`.

### Configuración del repositorio

- Activar **Automatically delete head branches** (borra la rama al hacer merge).
- Mantener **merge commits** (los commits ya vienen separados por tipo); desactivar squash y rebase para que el historial sea uniforme.
- **Ruleset sobre `main`:**
  - Requiere pull request (0 aprobaciones, porque eres el único desarrollador; se puede subir a 1 si entra otra persona).
  - Requiere que pasen los checks del CI y que la rama esté actualizada con `main`.
  - Bloquea force push y borrado de `main`.
  - Requiere resolver las conversaciones del PR antes del merge.
- **Environment `production`:** contiene los secretos del despliegue; solo lo puede usar la rama `main`.
- **Seguridad:** secret scanning con push protection, Dependabot alerts y Dependabot version updates (npm de cada proyecto, imágenes Docker y GitHub Actions; agrupado semanalmente).

## 4. CI: puerta de calidad

Workflow `ci.yml`, en cada PR hacia `main` y en cada push a `main`. Jobs en paralelo; solo corren los que tocan archivos cambiados, y un job final `ci-ok` es el único check requerido por el ruleset.

| Job | Qué valida | Falla si |
|---|---|---|
| `backend-quality` | ESLint (typescript-eslint, config estricta), `prettier --check`, `tsc --noEmit` | Hay errores de lint, formato o tipos |
| `backend-test` | Jest unitario + e2e contra un PostgreSQL 16 de servicio; `prisma validate`; `prisma migrate diff` entre migraciones y schema | Falla un test, baja la cobertura del umbral o el schema no coincide con las migraciones |
| `frontend-quality` | ESLint (`eslint-config-next`, reglas de hooks y accesibilidad), `prettier --check`, `tsc --noEmit` | Igual que en backend |
| `frontend-test` | Vitest para `lib/server` (sesión, BFF, validación con Zod) y `proxy.ts` | Falla un test o baja la cobertura |
| `build` | `next build` y build de ambas imágenes Docker (`target: runner`), sin publicarlas | No compila o la imagen no se construye |
| `security` | `pnpm audit --prod --audit-level=high`, dependency review (en PR), CodeQL (workflow aparte) | Dependencia con vulnerabilidad alta o crítica |
| `contract` | Regenera `openapi.json` en el backend y los tipos del frontend (sección 6) | Lo generado difiere de lo commiteado: backend y frontend no coinciden |
| `pr-title` | El título del PR sigue Conventional Commits | Título fuera de formato |

Criterios de calidad:

- **Cobertura:** umbral inicial del 70 % en los módulos con tests (auth, sesión, BFF) y se sube a medida que se agregan módulos. El umbral está en la config de Jest/Vitest, así que el CI falla solo.
- **Lint estricto:** sin `any` explícito, sin promesas sin manejar, sin variables sin usar, imports ordenados. Las reglas se activan como error, no como advertencia.
- **Formato único:** un `.prettierrc` por proyecto; los PR no discuten formato.
- **Caché** del store de pnpm para que el CI tarde pocos minutos.

## 5. CD: despliegue con rollback

Workflow `deploy.yml`, que se dispara cuando el CI pasa sobre `main` (`workflow_run`) o a mano (`workflow_dispatch`, con un tag para rollback). Usa `concurrency` para que nunca haya dos despliegues a la vez.

### Flujo

1. **Build y publicación:** construye las imágenes y las sube a GHCR:
   - `ghcr.io/alej011/ltgtsystem-backend:<sha>` y `:main`
   - `ghcr.io/alej011/ltgtsystem-frontend:<sha>` y `:main`
2. **Conexión:** se conecta al VPS por SSH, con usuario `deploy`, una llave dedicada y la huella del servidor fijada.
3. **Despliegue:** ejecuta `deploy/deploy.sh <sha>` en `/opt/ltgtsystem`:
   1. Guarda el tag actual como `previous`.
   2. Hace un respaldo de la base con `pg_dump` (`backups/pre-<sha>.sql.gz`).
   3. `docker compose pull` de las imágenes nuevas.
   4. Migraciones: `docker compose run --rm backend pnpm prisma:deploy`. Si fallan, se detiene sin tocar los contenedores en ejecución.
   5. `docker compose up -d` con el tag nuevo.
   6. Espera hasta 90 s a que backend y frontend estén `healthy`.
   7. Smoke test por HTTPS: `GET https://<dominio>/` y el login de la API responden.
   8. Si todo pasa, registra `current=<sha>`. Si algo falla, **rollback automático**: vuelve a `previous`, `up -d`, verifica salud y marca el workflow como fallido.
4. **Resumen:** el job escribe en el resumen del workflow qué versión quedó desplegada.

### Rollback

- **Automático:** si la versión nueva no pasa salud o smoke test, vuelve sola a la anterior.
- **Manual:** desde Actions, `deploy.yml` → Run workflow → tag (sha) de una versión anterior.
- Se conservan las últimas 5 imágenes en el VPS y en GHCR; las demás se limpian.
- **Límite importante:** el rollback revierte el código, no la base de datos (Prisma no tiene migraciones "down"). Por eso:
  - Las migraciones deben ser compatibles hacia atrás (expand/contract): primero agregar columnas o tablas, y en un despliegue posterior quitar lo viejo.
  - El `pg_dump` previo a cada despliegue permite restaurar a mano si una migración daña datos.

### Secretos (environment `production`)

| Secreto | Uso |
|---|---|
| `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS` | Conexión al VPS |
| `APP_DOMAIN` | Smoke test |

Las variables de la aplicación (`POSTGRES_*`, `JWT_ACCESS_SECRET`, etc.) viven solo en `/opt/ltgtsystem/.env` del VPS, con permisos `600`. No pasan por GitHub. Las imágenes no contienen secretos, por lo que pueden ser públicas en GHCR y el VPS las descarga sin credenciales.

## 6. Arquitectura del frontend

### Diseño del sistema (se mantiene)

El sistema es cliente-servidor y se ejecuta con Docker en cualquier entorno:

- Navegador → Next.js (presentación y BFF) → NestJS (negocio) → PostgreSQL.
- El backend ya es un monolito modular por dominio (`products`, `users`, `auth`, ...), y cada módulo sigue el patrón controller → service → Prisma.

Ese diseño es adecuado para el tamaño del proyecto y no cambia. Lo que falla es la **organización interna del frontend**: un mismo dominio está repartido por tipo de archivo y hay varios patrones conviviendo para resolver lo mismo.

### Diagnóstico

| Problema | Evidencia | Consecuencia |
|---|---|---|
| Un dominio repartido en 5 carpetas | Productos vive en `app/api/products`, `components/products`, `lib/features/products`, `lib/queries/product.queries.ts` y `lib/schemas/product.schema.ts` | Para cambiar una funcionalidad hay que recorrer todo el árbol; es fácil olvidar una parte |
| Tipos definidos tres veces | DTO en el backend, schema Zod en `lib/schemas` e interfaces escritas a mano en `*.service.ts` | Se desincronizan sin aviso (pasó con `brandId` en la fase 2) |
| Dos formas de pedir datos | `product.queries.ts` (React Query) existe pero ningún componente lo usa; productos, usuarios y el dashboard cargan con `useEffect` + `useState` | Sin caché ni reintentos, estados de carga y error repetidos a mano, recargas manuales tras cada cambio |
| Rutas de la API con verbos | Backend y BFF usan `/products/create`, `/products/list`, `/users/getById/:id`, `/users/update/:id`, `/products/delete/:id` | Contrato inconsistente; el método HTTP ya expresa la acción |
| Dos sistemas de permisos | `hasPermission` en `auth.service.ts` (6 usos) y otro `hasPermission` con hooks en `lib/shared/permissions.ts` (2 usos) | Reglas que pueden contradecirse |
| Mocks mezclados con código real | `tickets`, `knowledge`, `communications` y `dashboard` guardan datos en memoria dentro de su `*.service.ts` | Reemplazarlos por el backend real obliga a reescribir los componentes |
| Código sin uso | ~30 componentes de `components/ui` sin importar; `hooks/use-mobile` y `hooks/use-toast` duplicados en `components/ui`; toast antiguo junto a `sonner`; carpeta `cypress/` vacía | Ruido, más superficie para dependencias y lint |

### Revisión de arquitectura (18 nov 2026)

Una revisión de profundidad de módulos confirmó el diagnóstico y encontró un problema más de fondo: **mover los archivos a `features/` no basta**. Si `products.api.ts` y `products.queries.ts` solo cambian de carpeta, siguen siendo capas delgadas que reenvían llamadas, cada una con su propio modo de error. El objetivo es que cada dominio exponga **una interfaz pequeña** (hooks) y esconda todo lo demás detrás de ella.

El backend (`ProductsService`, `AuthService`) y `lib/server/backend.ts` ya están bien resueltos; los problemas están en el frontend y en la conexión entre ambos. Hoy no existe ningún test, así que cada cambio de esta sección debe llegar con los tests de su interfaz.

**Bugs encontrados (se corrigen primero, fase C.1):**

| Bug | Evidencia | Efecto |
|---|---|---|
| Un producto con precio 0 rompe toda la lista | Backend acepta `@Min(0)`; el BFF exige `price: z.number().positive()` (`product.schema.ts:54`) | La lista completa responde 502; el formulario tampoco puede crear con precio 0 |
| Descripción opcional en backend, obligatoria en el BFF | `@IsOptional` en el DTO vs `description: z.string()` | Productos sin descripción fallan la validación de respuesta |
| Borrado fallido silencioso | `deleteProduct` devuelve `false` en vez de lanzar error (`products.service.ts:233`) | El diálogo se cierra como si hubiera funcionado |
| Detalle no distingue "no existe" de "servidor caído" | `getProductById` devuelve `null` ante cualquier error | El modal muestra lo mismo en ambos casos |
| Empleado puede gestionar artículos de conocimiento | `article-list.tsx:71` y `knowledge/page.tsx:51` contradicen `PERMISSION_MATRIX.knowledge.create = ["admin"]`; además un rol ausente se trata como `empleado` | Permiso mayor al definido |
| El bloqueo por intentos de login es invisible | `auth.service` → `null` → `auth.queries` → "Credenciales inválidas" → `auth-context` → `false` | Un 429, un 502 o un timeout se muestran como contraseña incorrecta |
| El BFF acepta roles en minúscula que el backend rechaza | `BackendRoleSchema` admite `admin`, `support`…; el backend usa `@IsEnum(Role)` | Crear o editar usuario falla con 400 |

**Problemas de diseño (ordenados por importancia):**

| # | Problema | Evidencia | Propuesta |
|---|---|---|---|
| 1 | Cliente de productos con capas delgadas y modos de error contradictorios | Listar productos cruza 11 módulos; `products.service.ts` tiene 7 funciones y 7 tipos y cada una falla distinto; `error-handler.ts` solo reenvía; `product.queries.ts` no se usa; la regla de stock bajo (`<= 5`) está repetida en componente y dashboard | Un único **cliente de productos** con hooks de React Query como interfaz y un solo modo de error (siempre lanza `ApiClientError`). URLs, filtros, query keys, invalidación y reglas quedan dentro |
| 2 | Permisos en tres fuentes que se contradicen | `permissions.ts` (196 líneas, ~20 útiles y 9 envoltorios heredados), `hasPermission` de `auth.service.ts` y comparaciones `role ===` en componentes; "usuarios solo admin" está en 6 lugares | Una función pura rol × recurso × acción, usada por componentes, `proxy.ts` y layouts, y un test que la compara con los `@Roles` del backend |
| 3 | El contrato se escribe a mano 3 a 5 veces | La forma de `Product` existe 5 veces y su mapper 2; los filtros 3 veces; `User` y `UserRole` duplicados; el backend crea usuarios por dos caminos (`AuthService.register` y `UsersService.create`) con errores distintos | OpenAPI → tipos generados como única fuente; el BFF solo valida respuestas y deja de inventar reglas propias de entrada; un solo camino de alta de usuarios |
| 4 | Ningún módulo es dueño de la sesión | ~15 archivos conocen tokens, cookies, refresh o roles; "sesión expirada → login" está implementado 4 veces; dos vocabularios de roles (`ADMIN/SUPPORT` y `admin/empleado`) | Un módulo de sesión en el servidor (verificar, refrescar, cookies) con el refresh detrás de un adaptador reemplazable en tests, y un hook de sesión en el cliente con errores tipados (credenciales, bloqueado, no disponible). Un solo vocabulario de roles: el del backend |
| 5 | Los mocks definen la interfaz de tickets, conocimiento y comunicaciones | Lecturas síncronas sobre arrays en memoria (`getTickets(): Ticket[]`), fechas como `Date`, reglas de negocio dentro del mock | Darles ya la misma interfaz asíncrona que productos; el mock queda como un adaptador y luego se cambia por el BFF sin tocar componentes |
| 6 | El BFF copia a mano la tabla de rutas del backend | Tres tablas de rutas que no coinciden (navegador `/api/products/:id`, BFF `app/api/products/[id]`, backend `/api/products/detail/:id`); `API_ENDPOINTS` también incluye rutas que no existen | Misma ruta en los tres niveles (sale con las rutas REST); opcionalmente un reenviador genérico del BFF guiado por una tabla |

### Estructura objetivo: por funcionalidad (feature-based)

Cada dominio queda en una sola carpeta, igual que un módulo de Nest:

```
frontend/
├── app/                          Solo rutas: páginas delgadas y handlers del BFF
│   ├── (app)/products/page.tsx   Renderiza <ProductsView /> de features/products
│   └── api/products/
│       ├── route.ts              GET lista, POST crea
│       └── [id]/route.ts         GET, PATCH, DELETE
├── features/
│   ├── products/
│   │   ├── components/           product-list, product-form, product-detail
│   │   ├── products.client.ts    Interfaz del dominio: hooks (useProducts, useProduct,
│   │   │                         useSaveProduct, useDeleteProduct, useBrands, useCategories).
│   │   │                         Dentro: URLs, filtros, query keys, invalidación, reglas
│   │   ├── products.server.ts    Llamadas del BFF al backend (solo servidor)
│   │   └── products.schemas.ts   Zod: formularios y validación de respuestas, tipados
│   │                             contra los tipos generados
│   ├── users/  dashboard/
│   ├── auth/                     Hook de sesión del cliente (login, logout, usuario actual)
│   └── tickets/  knowledge/  communications/
│       ├── *.client.ts           Misma interfaz asíncrona que productos
│       └── *.mock.ts             Adaptador en memoria; luego se reemplaza por el BFF
├── shared/
│   ├── api/                      Cliente HTTP, helper del BFF, tipos generados
│   ├── session/                  Módulo de sesión del servidor: verificar, refrescar, cookies
│   ├── permissions.ts            Única política de permisos (rol × recurso × acción)
│   └── lib/                      utils, tonos de color
└── components/
    ├── ui/                       shadcn/ui (solo lo que se usa)
    └── layout/                   sidebar, error boundary
```

Reglas:

- `app/` no contiene lógica: importa de `features/`.
- Una feature no importa de otra; lo común va en `shared/`.
- `*.server.ts` y `shared/api/session.ts` llevan `import "server-only"`.
- Los componentes nunca llaman `fetch` ni `useEffect` para datos: usan los hooks de `*.client.ts`.
- Un solo modo de error: los hooks siempre lanzan `ApiClientError`; nunca devuelven `null`, `false` ni `[]` para indicar un fallo.
- Solo `shared/session/` conoce los nombres de las cookies y el flujo de refresh.
- Cada módulo nuevo o reorganizado llega con tests de su interfaz en el mismo PR.

### Contrato único entre backend y frontend

1. El backend genera `openapi.json` desde Swagger con un script, sin levantar el servidor. Para describir los DTOs sin repetir decoradores se usa el plugin de `@nestjs/swagger`.
2. El frontend genera sus tipos con `openapi-typescript` (`shared/api/schema.d.ts`).
3. Los schemas Zod se tipan contra esos tipos. Si el backend cambia un campo, el frontend deja de compilar.
4. El CI regenera ambos archivos y falla si difieren de lo commiteado (`git diff --exit-code`).

### API REST consistente

| Antes | Después |
|---|---|
| `GET /products/list` | `GET /products` |
| `POST /products/create` | `POST /products` |
| `GET /products/detail/:id` | `GET /products/:id` |
| `PATCH /products/update/:id` | `PATCH /products/:id` |
| `DELETE /products/delete/:id` | `DELETE /products/:id` |
| `GET /users/list`, `GET /users/getById/:id`, `POST /users/create`, `PATCH /users/update/:id` | `GET /users`, `GET /users/:id`, `POST /users`, `PATCH /users/:id` |
| `POST /auth/register` | `POST /users` (solo admin; se elimina el duplicado si ya cubre el caso) |

Backend y BFF cambian en el mismo PR, para que la conexión entre ambos no quede rota en ningún commit de `main`.

### Decisiones

- Las páginas siguen siendo componentes de cliente con React Query: es una aplicación interna detrás de login, y Server Components no aporta lo suficiente para justificar reescribirlas.
- Los módulos mock se dejan funcionando, pero aislados en `*.mock.ts` detrás de una interfaz asíncrona. Cuando exista el módulo real en el backend se cambia el adaptador, no los componentes.
- El backend es la autoridad de validación de entrada. El BFF valida la forma de las respuestas, pero no agrega reglas de entrada propias.
- Un solo vocabulario de roles en todo el sistema: el del backend (`ADMIN`, `SUPPORT`).

## 7. Preparación del VPS

Antes de empezar se necesita esta información (en el VPS, con un usuario con sudo):

```bash
cat /etc/os-release | head -3        # Sistema operativo
free -h && df -h /                   # Memoria y disco libres
docker ps --format '{{.Names}}\t{{.Ports}}'
sudo ss -tlnp                        # Puertos ocupados
systemctl status caddy --no-pager    # Si Caddy es servicio del sistema
docker ps | grep -i caddy            # O si corre en un contenedor
sudo ufw status                      # Firewall
```

Pasos (una sola vez):

1. Crear el usuario `deploy` (sin contraseña, solo llave SSH) en el grupo `docker`. El grupo `docker` equivale a root, así que la llave se usa solo desde GitHub Actions y se puede restringir por comando.
2. Endurecer SSH (si no está hecho): solo llaves, `PermitRootLogin no`; firewall con 22, 80 y 443; desactivar VNC del panel de Contabo cuando no se use.
3. Crear `/opt/ltgtsystem/` con `docker-compose.prod.yml`, `deploy.sh`, `.env` y `backups/`.
4. Crear el subdominio en DuckDNS y agregar el bloque al Caddyfile; `caddy reload`.
5. Primer despliegue manual con el mismo script, y seed inicial con `db:seed:prod` (una vez).
6. Respaldo diario por cron: `pg_dump` comprimido con retención de 7 días. Más adelante conviene copiarlo fuera del VPS.

## 8. Fases de trabajo

Cada fase es un milestone; cada punto, un issue y una rama (`alejo/<tipo>/<tema>`) con su PR.

| Fase | Entregable | PRs previstos |
|---|---|---|
| **A. GitHub** | Project, labels, milestones, borrado de ramas, tipo de merge, secret scanning, Dependabot | `chore(github)`: Dependabot y plantillas de PR/issue |
| **B. Calidad** | ESLint + Prettier en ambos proyectos y corrección del código existente; scripts unificados (`lint`, `format:check`, `typecheck`, `test`, `test:e2e`); Vitest en el frontend y la configuración de Jest en el backend, para que la fase C pueda traer sus tests | `chore(backend)`, `chore(frontend)`, `style` (formato masivo en un PR aparte, para no mezclarlo) |
| **C. Arquitectura del frontend** | Sección 6: bugs, limpieza, API REST, cliente por dominio, permisos únicos, contrato OpenAPI, módulo de sesión, mocks asíncronos | Ver el desglose abajo |
| **D. Tests base** | Lo que la fase C no cubrió. Backend: auth (login, refresh con rotación y periodo de gracia, logout, throttling), users y health; e2e con Postgres. Frontend: BFF y `proxy.ts` | `test(backend)`, `test(frontend)` |
| **E. CI** | `ci.yml` (incluye la verificación del contrato OpenAPI), CodeQL, chequeo de título del PR; luego el ruleset de `main` exigiendo `ci-ok` | `ci: ...` |
| **F. VPS** | Preparación de la sección 7, subdominio, Caddy, compose de producción basado en imágenes, primer despliegue manual | `feat(deploy)`: compose de producción y `deploy.sh` |
| **G. CD** | `deploy.yml` con GHCR, migración, healthcheck, smoke test, rollback automático y manual; respaldos | `ci(deploy)` |
| **H. Verificación** | Desplegar un cambio real, forzar un fallo (healthcheck roto) y comprobar el rollback; documentar en el README | `docs` |

Desglose de la fase C, ordenado por importancia (un PR por punto; cada uno se verifica contra el backend antes del merge). Los números entre paréntesis remiten a la tabla de problemas de diseño de la sección 6:

| # | PR | Contenido | Por qué en este lugar |
|---|---|---|---|
| C.1 | `fix`: bugs de la revisión | Precio 0 y descripción opcional en los schemas del BFF; error visible al fallar un borrado; 404 distinto de error en el detalle; permiso de conocimiento según la matriz (sin rol = sin permiso); mensaje propio para el 429 de login; roles del BFF solo en mayúscula | Son fallas visibles hoy y el arreglo es pequeño |
| C.2 | `chore(frontend)`: limpieza | Componentes de `components/ui` sin uso, `hooks/use-toast` y `components/ui/use-toast` (idénticos y sin uso), toast antiguo, `cypress/`, `lib/queries/product.queries.ts`, `ProductSchema` y `mapBackendProductToFrontend` sin uso, imports muertos | Reduce lo que hay que mover en los pasos siguientes |
| C.3 | `refactor(api)`: rutas REST | Rutas REST en backend y BFF en el mismo PR; la ruta del navegador, la del BFF y la del backend pasan a ser la misma, y se elimina `API_ENDPOINTS` (6, primera parte) | Los hooks de C.4 nacen con las rutas definitivas |
| C.4 | `refactor(frontend)`: cliente de productos (1) | Crear `features/products` moviendo y profundizando a la vez: `products.client.ts` con hooks y un solo modo de error, sin `error-handler.ts` ni el segundo mapper; la regla de stock bajo y las opciones de categoría salen de los componentes. Luego usuarios y dashboard con el mismo patrón. Tests de los hooks contra un BFF simulado | Es el punto más cambiado del repo y la plantilla para el resto |
| C.5 | `refactor(frontend)`: política de permisos (2) | Una función pura en `shared/permissions.ts`; se eliminan el `hasPermission` de `auth.service.ts`, los envoltorios heredados y los `role ===` sueltos. Tests de tabla y test en el backend que compara con `@Roles` | Lógica pequeña y pura; se puede hacer en paralelo con C.4 |
| C.6 | `feat(api)`: contrato OpenAPI (3) | `openapi.json` en el backend, tipos generados en el frontend, schemas Zod tipados contra ellos, sin interfaces escritas a mano; un solo camino de alta de usuarios en el backend | Corrige en el origen la familia de bugs de C.1 |
| C.7 | `refactor(frontend)`: módulo de sesión (4) | `shared/session/` en el servidor (verificar, refrescar, cookies) con adaptador de refresh; `proxy.ts`, layouts y `backend.ts` lo usan. En el cliente, un hook de sesión que reemplaza `auth.service`, `auth.queries` y `auth-context`. Un solo vocabulario de roles | Es el de mayor beneficio para los tests de `lib/server` y `proxy.ts`, pero toca más archivos |
| C.8 | `refactor(frontend)`: mocks asíncronos (5) | `tickets`, `knowledge` y `communications` con la interfaz de C.4 y el mock como adaptador en `*.mock.ts`; colores y etiquetas a un helper de presentación; las reglas de negocio del mock se anotan como requisitos del backend | Debe estar antes de construir esos módulos en el backend |
| C.9 | `refactor(frontend)`: reenviador del BFF (6, segunda parte, opcional) | Un reenviador genérico guiado por una tabla por recurso; login y logout quedan aparte | Solo si después de C.3 los handlers siguen siendo copias |

Después de la fase H se retoma el trabajo funcional (tickets, comentarios, conocimiento, comunicaciones), ya con CI y CD protegiendo cada cambio. Gracias a la fase C, cada módulo real solo reemplaza su adaptador `*.mock.ts` por el del BFF.

Orden y dependencias: A → B → C → D → E (los tests se escriben sobre la estructura final; el ruleset necesita que el check exista). F puede avanzar en paralelo con B–E. G necesita E y F.

## 9. Riesgos y decisiones

| Riesgo | Mitigación |
|---|---|
| El VPS es compartido: un problema de LTGT afecta a la red social | Límites de memoria, contenedores y red separados, Caddy sin cambios para el sitio existente |
| Rollback no revierte la base | Migraciones compatibles hacia atrás + `pg_dump` antes de cada despliegue |
| Breve corte durante el despliegue (unos segundos al recrear contenedores) | Aceptable para este proyecto; si molesta, se pasa a blue/green con dos frontends detrás de Caddy |
| La llave SSH de despliegue da acceso a Docker (equivale a root) | Llave exclusiva para Actions, solo en el environment `production`, restringible a `deploy.sh` en `authorized_keys` |
| Repo público | Ningún secreto en el repo; secretos solo en el environment y en el `.env` del VPS; los PR desde forks no reciben secretos |
| DuckDNS no responde | Afecta solo la resolución DNS; a futuro se puede pasar a un dominio propio sin cambiar nada más que el bloque de Caddy |
