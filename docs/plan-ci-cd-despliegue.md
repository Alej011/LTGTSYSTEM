# Plan de CI/CD y despliegue — LTGTSYSTEM

Objetivo: publicar el sistema en el VPS de Contabo (donde ya corre otra aplicación) con su propio dominio y HTTPS, y que todo cambio pase por un pipeline de calidad (CI) antes de entrar a `main` y desplegarse solo (CD), con rollback automático si falla.

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

## 6. Preparación del VPS

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

## 7. Fases de trabajo

Cada fase es un milestone; cada punto, un issue y una rama (`alejo/<tipo>/<tema>`) con su PR.

| Fase | Entregable | PRs previstos |
|---|---|---|
| **A. GitHub** | Project, labels, milestones, borrado de ramas, tipo de merge, secret scanning, Dependabot | `chore(github)`: Dependabot y plantillas de PR/issue |
| **B. Calidad** | ESLint + Prettier en ambos proyectos y corrección del código existente; scripts unificados (`lint`, `format:check`, `typecheck`, `test`, `test:e2e`) | `chore(backend)`, `chore(frontend)`, `style` (formato masivo en un PR aparte, para no mezclarlo) |
| **C. Tests base** | Backend: auth (login, refresh con rotación y periodo de gracia, logout, throttling), users y health; e2e con Postgres. Frontend: sesión, BFF y `proxy.ts` | `test(backend)`, `test(frontend)` |
| **D. CI** | `ci.yml`, CodeQL, chequeo de título del PR; luego el ruleset de `main` exigiendo `ci-ok` | `ci: ...` |
| **E. VPS** | Preparación de la sección 6, subdominio, Caddy, compose de producción basado en imágenes, primer despliegue manual | `feat(deploy)`: compose de producción y `deploy.sh` |
| **F. CD** | `deploy.yml` con GHCR, migración, healthcheck, smoke test, rollback automático y manual; respaldos | `ci(deploy)` |
| **G. Verificación** | Desplegar un cambio real, forzar un fallo (healthcheck roto) y comprobar el rollback; documentar en el README | `docs` |

Después de la fase G se retoma el trabajo funcional (tickets, comentarios, conocimiento, comunicaciones), ya con CI y CD protegiendo cada cambio.

Orden y dependencias: A → B → C → D (el ruleset necesita que el check exista). E puede avanzar en paralelo con B–D. F necesita D y E.

## 8. Riesgos y decisiones

| Riesgo | Mitigación |
|---|---|
| El VPS es compartido: un problema de LTGT afecta a la red social | Límites de memoria, contenedores y red separados, Caddy sin cambios para el sitio existente |
| Rollback no revierte la base | Migraciones compatibles hacia atrás + `pg_dump` antes de cada despliegue |
| Breve corte durante el despliegue (unos segundos al recrear contenedores) | Aceptable para este proyecto; si molesta, se pasa a blue/green con dos frontends detrás de Caddy |
| La llave SSH de despliegue da acceso a Docker (equivale a root) | Llave exclusiva para Actions, solo en el environment `production`, restringible a `deploy.sh` en `authorized_keys` |
| Repo público | Ningún secreto en el repo; secretos solo en el environment y en el `.env` del VPS; los PR desde forks no reciben secretos |
| DuckDNS no responde | Afecta solo la resolución DNS; a futuro se puede pasar a un dominio propio sin cambiar nada más que el bloque de Caddy |
