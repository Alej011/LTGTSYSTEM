# Roles, permisos y departamentos — LTGTSYSTEM

Especificación de la fase I del plan de trabajo (`plan-ci-cd-despliegue.md`). Define el modelo de acceso que reemplaza a los roles fijos `ADMIN` y `SUPPORT`, las historias de usuario que lo describen y el modelo de tickets que lo usa. La decisión de fondo está en `adr/0001-roles-dinamicos-con-alcance.md` y los términos en `../GLOSSARY.md`.

Alcance: una sola empresa. No hay sucursales; si llegaran a existir, se agregan como un nivel de alcance más (ver sección 7).

## 1. Situación actual

Los roles son parte del código: `enum Role { ADMIN SUPPORT }` en Prisma, el mismo enum en `openapi.json`, `@Roles(...)` en cada endpoint y la tabla `POLICY` en `frontend/shared/permissions.ts`. Agregar un rol exige una migración, cambiar el contrato y desplegar.

Faltan además dos conceptos que los módulos de tickets y comunicaciones ya suponen:

- **Quién reporta:** el sistema no tiene un rol para el empleado que solo abre tickets.
- **Departamentos:** comunicaciones filtra por departamento, pero los usuarios no tienen uno.

## 2. Modelo

Un usuario tiene **un rol** (qué puede hacer) y **un departamento** (dónde). Cada permiso que un rol concede lleva un **alcance** (sobre qué datos).

```
Usuario ── rol ──────────► Rol ── concede ──► Permiso (recurso:acción) + alcance
       └── departamento ─► Departamento
```

### Alcances

| Alcance | Significa | Ejemplo |
|---|---|---|
| `OWN` | Solo lo que el usuario creó o tiene asignado | Un Member ve sus propios tickets |
| `DEPARTMENT` | Todo lo de su departamento | Un Manager ve los tickets de su equipo |
| `ALL` | Todo en la empresa | Un Agente de soporte ve todos los tickets |

Los recursos que no pertenecen a nadie (catálogo de productos, marcas, categorías) solo usan `ALL`.

### Catálogo de permisos

El catálogo es fijo y vive en el código: un recurso nuevo siempre se programa. Lo que es dato es qué rol tiene cada permiso y con qué alcance.

| Recurso | Acciones |
|---|---|
| `dashboard` | `view` |
| `products` | `view`, `view_details`, `create`, `edit`, `delete` |
| `users` | `view`, `create`, `edit`, `deactivate` |
| `roles` | `manage` |
| `departments` | `manage` |
| `tickets` | `create`, `view`, `comment`, `handle`, `assign`, `close`, `delete` |
| `knowledge` | `view`, `create`, `edit`, `delete` |
| `communications` | `view`, `create`, `edit`, `delete` |

`tickets:handle` es "atender tickets": cambiar su estado, registrar la solución, escribir notas internas y tomar un ticket sin asignar. Solo un usuario con este permiso puede ser asignado a un ticket.

### Roles iniciales (seed)

| Rol | Tipo | Permisos y alcance |
|---|---|---|
| **Administrador** | Sistema | Todos, alcance `ALL`, de forma implícita |
| **Agente de soporte** | Normal | Los que hoy tiene `SUPPORT` + `tickets:handle` y `tickets:comment` en `ALL`; `knowledge:create/edit` en `ALL` |
| **Manager** | Normal | `tickets:view` y `tickets:assign` en `DEPARTMENT`; `communications:create/edit` y `knowledge:create/edit` en `DEPARTMENT`; `users:view` en `DEPARTMENT`; lectura de productos |
| **Member** | Normal | `tickets:create`, `tickets:view`, `tickets:comment` y `tickets:close` en `OWN`; lectura de productos, conocimiento y comunicaciones |
| **Viewer** | Normal | Solo lectura: `dashboard`, `knowledge:view`, `communications:view` |

Los usuarios actuales migran así: `ADMIN` → Administrador, `SUPPORT` → Agente de soporte, con exactamente los permisos que tienen hoy.

### Reglas del rol Administrador

| Regla | Motivo |
|---|---|
| Tiene todos los permisos con alcance `ALL` sin consultar la tabla de permisos | Los permisos que se programen después le llegan solos |
| No se puede editar ni borrar (`is_system`) | Nadie puede quitarle permisos |
| Siempre existe al menos un usuario activo con este rol | No se puede degradar ni desactivar al último |
| Un administrador no puede cambiar su propio rol ni desactivarse | Evita quedarse fuera por error |
| Puede pertenecer a un departamento, pero ese departamento no le limita nada | Es solo un dato organizativo |

### Alta de usuarios

El alta, los cambios y la baja de usuarios son centralizados: solo el Administrador tiene `users:create`, `users:edit` y `users:deactivate`. Es el estándar de gestión del ciclo de vida de identidades: un jefe de área no puede verificar que una persona trabaje en la empresa ni pertenezca a su departamento, y las cuentas creadas por cada jefe tienden a quedar activas cuando la persona se va.

- El Manager solo ve a los miembros de su departamento (`users:view` en `DEPARTMENT`).
- Si RRHH asume las altas, se le crea un rol con `users:create` en alcance `ALL`. Ningún rol con alcance `DEPARTMENT` o `OWN` recibe `users:create`, `users:edit` ni `users:deactivate`.
- Nadie puede registrarse por su cuenta.

### Visibilidad de artículos de conocimiento

El autor de un artículo decide quién lo ve: **toda la empresa** o **uno o más departamentos**. Así un empleado encuentra la solución a un problema básico (por ejemplo, la conexión de red) sin abrir un ticket, y los procedimientos internos de un área no los ve el resto.

- El autor y el Administrador siempre ven el artículo.
- Los destinos que puede elegir el autor dependen del alcance de su `knowledge:create`: con `ALL` (Agente de soporte, Administrador), cualquier departamento o toda la empresa; con `DEPARTMENT` (Manager), solo su departamento.
- Cualquier usuario con `knowledge:view` ve los artículos de toda la empresa y los dirigidos a su departamento.
- La visibilidad es por departamento, no por rol dentro del departamento.

## 3. Escenarios de referencia

Estos usuarios sirven para entender las historias y como datos del seed de los tests e2e de la fase.

| Usuario | Rol | Departamento |
|---|---|---|
| Laura | Administrador | Gerencia |
| Pedro | Manager | Soporte |
| Luis | Agente de soporte | Soporte |
| Sofía | Manager | Marketing |
| Ana | Member | Marketing |
| Diego | Viewer | Ventas |

| Situación | Resultado |
|---|---|
| Laura ve y reasigna tickets de cualquier departamento | Permitido (`ALL`) |
| Laura publica una comunicación para Marketing o para toda la empresa | Permitido |
| Pedro ve los tickets que atiende su equipo | Permitido (`DEPARTMENT`) |
| Pedro publica una comunicación para Marketing | Denegado: no es su departamento |
| Luis toma un ticket sin asignar y lo resuelve | Permitido (`tickets:handle`) |
| Sofía publica una comunicación para Marketing | Permitido |
| Sofía ve los tickets de Soporte | Denegado |
| Ana abre un ticket y lo ve | Permitido (`OWN`) |
| Ana ve los tickets de otra persona de Marketing | Denegado; Sofía sí puede |
| Ana es asignada a un ticket | Imposible: no tiene `tickets:handle` |
| Diego abre un ticket | Denegado: Viewer es solo lectura |
| Sofía crea una cuenta para una persona nueva de Marketing | Denegado: solo el Administrador crea usuarios |
| Sofía ve la lista de usuarios de Marketing | Permitido (`users:view` en `DEPARTMENT`) |
| Luis publica "Cómo reiniciar el router" para toda la empresa | Permitido; Ana y Diego lo ven |
| Luis publica "Procedimiento de escalamiento" solo para Soporte | Permitido; Ana no lo ve |
| Sofía publica un artículo para Ventas | Denegado: solo puede publicar para Marketing |
| Ana deja un ticket Resuelto sin responder durante 3 días | El ticket se cierra solo, como cierre automático |

## 4. Historias de usuario

Formato: *Como [rol], quiero [acción], para [beneficio]*. Los criterios de aceptación usan *Dado / Cuando / Entonces* y se convierten en tests e2e de la fase.

### Roles y permisos

**HU-R01 — Crear un rol**
Como Administrador, quiero crear un rol con un nombre y un conjunto de permisos con su alcance, para adaptar el sistema a una nueva área sin programar.
- Dado que Laura está en la pantalla de roles, cuando crea "Logística" con `tickets:create` en `OWN`, entonces el rol aparece en la lista y puede asignarse a usuarios.
- Cuando intenta crear un rol con un nombre que ya existe, entonces recibe un error junto al campo y no se crea nada.
- Dado que Pedro (Manager) no tiene `roles:manage`, cuando abre la pantalla de roles, entonces no la ve en el menú y la API responde 403.

**HU-R02 — Editar los permisos de un rol**
Como Administrador, quiero cambiar los permisos de un rol, para ajustar lo que puede hacer un área.
- Cuando Laura quita `tickets:assign` al rol Manager, entonces Pedro deja de poder asignar tickets como máximo al renovarse su sesión (15 minutos).
- Cuando intenta editar el rol Administrador, entonces el sistema no lo permite.

**HU-R03 — Borrar un rol**
Como Administrador, quiero borrar un rol que ya no se usa, para mantener la lista ordenada.
- Dado un rol sin usuarios, cuando Laura lo borra, entonces desaparece.
- Dado un rol con usuarios, cuando intenta borrarlo, entonces el sistema pide reasignar esos usuarios primero.
- El rol Administrador no se puede borrar.

**HU-R04 — Ver mis permisos efectivos**
Como cualquier usuario, quiero que la interfaz muestre solo lo que puedo hacer, para no encontrarme con botones que fallan.
- Dado que Ana es Member, cuando entra al sistema, entonces no ve "Usuarios" ni "Roles" en el menú ni el botón "Asignar" en los tickets.

### Usuarios y departamentos

**HU-U01 — Gestionar departamentos**
Como Administrador, quiero crear, renombrar y desactivar departamentos, para reflejar la estructura de la empresa.
- Cuando Laura desactiva un departamento con usuarios, entonces el sistema pide moverlos primero.

**HU-U02 — Asignar rol y departamento a un usuario**
Como Administrador, quiero elegir el rol y el departamento al crear o editar un usuario, para definir qué puede hacer y sobre qué datos.
- Solo el Administrador ve el botón "Nuevo usuario"; a cualquier otro rol la API le responde 403 al intentar crear, editar o desactivar.
- Cuando Laura crea a Ana como Member de Marketing, entonces Ana solo ve sus propios tickets.
- Un usuario con un rol de alcance `DEPARTMENT` debe tener departamento; el formulario lo exige.

**HU-U05 — Ver a mi equipo**
Como Manager, quiero ver a los usuarios de mi departamento, para saber quién forma parte de mi equipo.
- Sofía ve a los usuarios de Marketing, sin botones para crear, editar ni desactivar.
- Sofía no ve a los usuarios de otros departamentos.

**HU-U03 — Proteger al último administrador**
Como empresa, quiero que siempre exista un administrador activo, para no perder el control del sistema.
- Dado que Laura es la única Administradora, cuando intenta cambiarse de rol o desactivarse, entonces el sistema lo impide con un mensaje claro.
- Dado que hay dos administradores, cuando Laura degrada al otro, entonces se permite.

**HU-U04 — Desactivar en lugar de borrar**
Como Administrador, quiero desactivar a un usuario que deja la empresa, para que no pueda entrar sin perder su historial de tickets y comentarios.
- Cuando Laura desactiva a Diego, entonces sus sesiones se revocan y no puede iniciar sesión; sus tickets siguen mostrando su nombre.

### Tickets

**HU-T01 — Reportar un problema**
Como Member, quiero abrir un ticket con título, descripción, categoría y prioridad, para pedir ayuda a soporte.
- Cuando Ana crea un ticket, entonces queda en estado Abierto, sin asignar, con ella como solicitante.
- Diego (Viewer) no ve el botón "Nuevo ticket".

**HU-T02 — Ver mis tickets**
Como Member, quiero ver los tickets que abrí y su estado, para dar seguimiento.
- Ana ve solo sus tickets; Sofía (Manager de Marketing) ve los de todo Marketing; Luis (Agente) ve todos.

**HU-T03 — Tomar un ticket**
Como Agente de soporte, quiero tomar un ticket sin asignar, para hacerme responsable.
- Cuando Luis toma un ticket Abierto, entonces queda asignado a él y pasa a En progreso.
- Un ticket ya asignado a otro agente no muestra la opción "Tomar".

**HU-T04 — Asignar un ticket**
Como Administrador o Manager de Soporte, quiero asignar o reasignar un ticket a un agente, para repartir el trabajo.
- La lista de posibles asignados solo incluye usuarios activos con `tickets:handle`.
- Pedro, con `tickets:assign` en `DEPARTMENT`, solo asigna a agentes de Soporte.

**HU-T05 — Resolver un ticket**
Como Agente de soporte asignado, quiero marcar el ticket como Resuelto registrando la solución, para que el solicitante sepa qué se hizo.
- No se puede pasar a Resuelto sin escribir la solución: es la validación de que el problema se resolvió.
- Al resolver se registra la fecha de resolución y el solicitante tiene 3 días corridos para confirmar o reabrir.

**HU-T06 — Confirmar o reabrir**
Como solicitante, quiero confirmar que la solución funcionó o reabrir el ticket, para cerrar el caso solo cuando de verdad está resuelto.
- Cuando Ana confirma, el ticket pasa a Cerrado y se registra la fecha de cierre.
- Cuando Ana lo reabre, vuelve a En progreso con el mismo agente.
- Un ticket Cerrado no se reabre; se abre uno nuevo.

**HU-T08 — Cierre automático**
Como empresa, quiero que un ticket Resuelto se cierre solo si el solicitante no responde, para que la cola no se llene de tickets resueltos sin confirmar.
- Dado un ticket Resuelto hace más de 3 días corridos sin respuesta del solicitante, entonces el sistema lo pasa a Cerrado y registra que el cierre fue automático.
- Si el solicitante lo reabrió dentro de los 3 días, el plazo deja de correr; vuelve a empezar cuando el agente lo resuelva de nuevo.
- En el detalle del ticket se distingue "Cerrado por el solicitante", "Cerrado automáticamente" y "Cerrado por un Administrador".

**HU-T07 — Comentar y dejar notas internas**
Como participante de un ticket, quiero comentar, para conversar con soporte; como Agente, quiero dejar notas internas que el solicitante no ve.
- Ana no ve las notas internas de Luis.
- Cualquier usuario que puede ver el ticket y tiene `tickets:comment` puede comentar.

### Base de conocimientos

**HU-K01 — Publicar un artículo con visibilidad**
Como Agente de soporte, quiero publicar un artículo y elegir qué departamentos lo ven, para que los empleados resuelvan problemas básicos sin abrir tickets.
- Luis elige "Toda la empresa" o uno o más departamentos; sin elegir ninguno no puede publicar.
- Sofía (Manager de Marketing) solo puede elegir Marketing.
- Diego (Viewer) no ve el botón "Nuevo artículo".

**HU-K02 — Leer los artículos que me corresponden**
Como Member, quiero ver los artículos de toda la empresa y los de mi departamento, para encontrar soluciones sin ruido de otras áreas.
- Ana ve "Cómo reiniciar el router" (toda la empresa) y no ve "Procedimiento de escalamiento" (solo Soporte).
- La búsqueda solo devuelve artículos visibles para el usuario.

**HU-K03 — Cambiar la visibilidad**
Como autor de un artículo, quiero cambiar los departamentos que lo ven, para ampliar o restringir su alcance.
- Al quitar un departamento, sus usuarios dejan de ver el artículo de inmediato.

### Comunicaciones

**HU-C01 — Publicar para un departamento**
Como Manager, quiero publicar comunicaciones para mi departamento, para informar a mi equipo.
- Sofía puede elegir como destino solo Marketing.
- Laura puede elegir cualquier departamento o toda la empresa.

**HU-C02 — Leer las comunicaciones que me corresponden**
Como usuario, quiero ver las comunicaciones de mi departamento y las de toda la empresa, para estar informado sin ruido de otras áreas.
- Ana ve las de Marketing y las generales, no las de Ventas.

## 5. Modelo de tickets

Se toma como correcto el modelo que hoy usa la interfaz (más completo que el schema de Prisma actual), con los valores en inglés como el resto del backend y las etiquetas en español en pantalla. El schema de Prisma se extiende cuando se construya el módulo real.

| Campo | Valores / tipo |
|---|---|
| `status` | `OPEN` Abierto, `IN_PROGRESS` En progreso, `RESOLVED` Resuelto, `CLOSED` Cerrado |
| `priority` | `LOW` Baja, `MEDIUM` Media, `HIGH` Alta, `CRITICAL` Crítica |
| `category` | `HARDWARE` Hardware, `SOFTWARE` Software, `NETWORK` Red/Conectividad, `ACCESS` Acceso/Permisos, `OTHER` Otro |
| `requester` | `{ id, name }` del solicitante |
| `assignee` | `{ id, name }` o `null` |
| `solution` | Texto o `null`; obligatoria para pasar a `RESOLVED` |
| `createdAt`, `updatedAt`, `resolvedAt`, `closedAt` | Fechas ISO; las dos últimas pueden ser `null` |
| `closeReason` | `CONFIRMED` (solicitante), `AUTO` (3 días sin respuesta), `ADMIN`, o `null` si no está cerrado |

Comentario: `id`, `ticketId`, `author` (`{ id, name }` o `null` si el usuario fue eliminado), `content`, `isInternal`, `createdAt`.

### Transiciones de estado

```
OPEN ──tomar/asignar──► IN_PROGRESS ──resolver (con solución)──► RESOLVED ──confirmar──► CLOSED
                              ▲                                     │
                              └────────────reabrir──────────────────┘
Sistema: cierra un ticket RESOLVED tras 3 días corridos sin respuesta del solicitante.
Administrador: puede cerrar un ticket en cualquier estado.
```

### Cambios de schema pendientes (módulo real)

- `TicketStatus`: agregar `RESOLVED`. `TicketPriority`: agregar `CRITICAL`.
- Nuevo enum `TicketCategory` y columna `category`.
- Columnas `solution` y `resolved_at` en `tickets`; `is_internal` en `comments`.
- `created_by_id` se mantiene y representa al solicitante.
- Columna `close_reason` (`CONFIRMED`, `AUTO`, `ADMIN`) en `tickets`.
- `knowledge_articles`: agregar `author_id` e `is_company_wide`, y la tabla `knowledge_article_departments` (`article_id`, `department_id`) para la visibilidad por departamento.

## 6. Diseño técnico

### Datos

```
roles             id, name (único), description, is_system, created_at, updated_at
role_permissions  role_id, resource, action, scope     (clave: role_id + resource + action)
departments       id, name (único), is_active, created_at, updated_at
users             + role_id (FK roles), + department_id (FK departments, opcional), + is_active
```

### Backend

- `@RequirePermission('tickets', 'assign')` reemplaza a `@Roles(...)`. El guard resuelve el permiso del usuario y deja el alcance disponible para el servicio.
- Los servicios aplican el alcance en la consulta (`where`): `OWN` filtra por creador o asignado, `DEPARTMENT` por el departamento del usuario. La autorización no se resuelve solo en el guard.
- El access token lleva `sub`, `roleId` y la lista compacta de permisos (`tickets:view:OWN`). Un cambio de permisos se aplica al renovarse la sesión (máximo 15 minutos).
- Las reglas del rol Administrador (sección 2) se validan en el servicio de usuarios y en el de roles, con tests propios.
- Cierre automático: una tarea programada (`@nestjs/schedule`, cada hora) pasa a `CLOSED` con `close_reason = AUTO` los tickets `RESOLVED` con `resolved_at` anterior a 3 días corridos.
- Visibilidad de artículos: el servicio de conocimiento filtra por `is_company_wide` o por los departamentos del artículo; la búsqueda usa el mismo filtro.

### Frontend

- `can(resource, action)` deja de leer la tabla fija `POLICY` y usa los permisos de la sesión. Los componentes no cambian, porque desde C.8 solo preguntan permisos y nunca el nombre del rol.
- `proxy.ts` y los layouts del servidor leen los permisos del token para proteger las páginas.
- Pantallas nuevas: roles (lista, crear y editar con una matriz de permisos por alcance) y departamentos.

### Contrato

Cambia una sola vez: `role` pasa de enum a `{ id, name }`, la sesión (`/auth/me`) incluye los permisos efectivos y aparecen los endpoints de roles y departamentos. Después, crear roles no cambia el contrato.

### Migración sin cortes (expand/contract)

1. Crear `roles`, `role_permissions` y `departments`; sembrar los roles iniciales y un departamento por defecto.
2. Agregar `users.role_id` y llenarlo desde el enum actual (`ADMIN` → Administrador, `SUPPORT` → Agente de soporte). El enum sigue existiendo.
3. Cambiar guards, token, sesión y frontend para usar permisos.
4. En un despliegue posterior, eliminar la columna y el enum `Role`.

### Tests

- Una tabla de casos con los escenarios de la sección 3 (usuario × recurso × acción × resultado esperado), contra el backend con Postgres.
- Reglas del Administrador: último administrador, auto-degradación y rol no editable.
- El test actual que compara `POLICY` con los `@Roles` se reemplaza por uno que compara el seed con el catálogo de permisos.

## 7. Fuera de alcance

- **Sucursales.** Si se necesitan, se agrega la tabla de sucursales y el alcance `BRANCH` entre `DEPARTMENT` y `ALL`. El Administrador pasa a ser el superadministrador y se crea un rol normal "Admin de sucursal". El modelo de alcances ya lo permite sin rediseño.
- **Invitados externos.** No hay usuarios fuera de la empresa.
- **Permisos por usuario.** Los permisos siempre vienen del rol; no hay excepciones individuales.
- **Solicitudes de alta con aprobación.** Un Manager no puede pedir altas desde el sistema; se resuelve fuera de él hasta que haga falta un flujo de solicitud y aprobación.
- **Visibilidad por rol dentro del departamento.** Los artículos se dirigen a departamentos, no a roles.

## 8. Decisiones tomadas

| Pregunta | Decisión |
|---|---|
| ¿Un ticket Resuelto se cierra solo? | Sí, a los 3 días corridos sin respuesta del solicitante (HU-T08). Pasar a Resuelto exige registrar la solución |
| ¿Un Manager puede crear usuarios? | No. Solo el Administrador; el Manager ve a los usuarios de su departamento (sección 2, HU-U02 y HU-U05) |
| ¿Quién ve los artículos de conocimiento? | Toda la empresa o los departamentos que elija el autor, dentro de su alcance (sección 2, HU-K01 a HU-K03) |
