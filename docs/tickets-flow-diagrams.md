# Diagramas de Flujo - Módulo de Tickets (Soporte Técnico)

## 1. Diagrama de Casos de Uso

```mermaid
graph TB
    User[👤 Usuario]
    Support[👨‍💻 Soporte/Empleado]
    Admin[👑 Administrador]

    subgraph "Módulo de Soporte Técnico"
        UC1[Crear Ticket]
        UC2[Ver Mis Tickets]
        UC3[Ver Detalle Ticket]
        UC4[Agregar Comentarios]
        UC5[Buscar Tickets]
        UC6[Filtrar por Estado]
        UC7[Filtrar por Prioridad]

        UC8[Ver Todos los Tickets]
        UC9[Asignarse Ticket]
        UC10[Actualizar Estado]
        UC11[Marcar como Resuelto]
        UC12[Agregar Solución]
        UC13[Filtrar por Asignación]
        UC14[Cerrar Ticket]

        UC15[Eliminar Ticket]
        UC16[Reasignar Ticket]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    Support --> UC1
    Support --> UC2
    Support --> UC3
    Support --> UC4
    Support --> UC8
    Support --> UC9
    Support --> UC10
    Support --> UC11
    Support --> UC12
    Support --> UC13
    Support --> UC14

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16

    style User fill:#a8dadc
    style Support fill:#457b9d
    style Admin fill:#e63946
    style UC9 fill:#ffe66d
    style UC10 fill:#ffe66d
    style UC11 fill:#ffe66d
    style UC15 fill:#ff6b6b
```

## 2. Ciclo de Vida Completo de un Ticket

```mermaid
sequenceDiagram
    actor Usuario as 👤 Usuario
    actor Soporte as 👨‍💻 Soporte
    participant UI as TicketForm/Detail
    participant Service as tickets.service
    participant Backend as Backend API
    participant DB as Database

    Note over Usuario,DB: FASE 1: CREACIÓN

    Usuario->>UI: Reporta problema
    UI->>Usuario: Formulario creación
    Usuario->>UI: Completa:<br/>- Título<br/>- Descripción<br/>- Categoría<br/>- Prioridad

    UI->>Service: createTicket(data)
    Service->>Backend: POST /api/tickets
    Backend->>DB: INSERT ticket<br/>status=ABIERTO<br/>assignedTo=null
    DB-->>Backend: Ticket creado
    Backend-->>Service: Ticket
    Service-->>UI: Success
    UI-->>Usuario: Ticket #123 creado

    Note over Usuario,DB: FASE 2: ASIGNACIÓN

    Soporte->>UI: Filtra tickets sin asignar
    UI->>Service: getTickets(filter: unassigned)
    Service->>Backend: GET /api/tickets?assigned=false
    Backend->>DB: SELECT WHERE assignedTo IS NULL
    DB-->>Backend: Tickets[]
    Backend-->>Service: Tickets[]
    Service-->>UI: Lista tickets

    Soporte->>UI: Abre ticket #123
    UI->>Service: getTicketById(123)
    Service-->>UI: Ticket details

    Soporte->>UI: Cambia estado a<br/>"En Progreso"
    UI->>Service: updateTicket(123, {status: "en_progreso"})
    Service->>Backend: PATCH /api/tickets/123
    Backend->>Backend: Auto-asignar a Soporte
    Backend->>DB: UPDATE ticket<br/>SET status=EN_PROGRESO<br/>assignedTo=soporteId
    DB-->>Backend: Updated
    Backend-->>UI: Ticket actualizado

    Note over Usuario,DB: FASE 3: INVESTIGACIÓN

    Soporte->>UI: Agrega comentario:<br/>"Revisando logs..."
    UI->>Service: addComment(ticketId, comment)
    Service->>Backend: POST /api/tickets/123/comments
    Backend->>DB: INSERT comment
    DB-->>Backend: Comment created
    Backend-->>Usuario: Notificación (futuro)

    Note over Usuario,DB: FASE 4: RESOLUCIÓN

    Soporte->>UI: Marca como "Resuelto"<br/>+ Solución
    UI->>UI: Validar solución requerida
    UI->>Service: updateTicket(123, {<br/>status: "resuelto",<br/>solution: "..."<br/>})

    Service->>Backend: PATCH /api/tickets/123
    Backend->>DB: UPDATE ticket<br/>SET status=RESUELTO<br/>solution=...<br/>resolvedAt=NOW()
    DB-->>Backend: Updated
    Backend-->>Service: Ticket
    Service-->>UI: Actualizado
    UI-->>Usuario: Notificación (futuro)

    Note over Usuario,DB: FASE 5: CIERRE

    Usuario->>UI: Confirma solución
    UI->>Service: updateTicket(123, {<br/>status: "cerrado"<br/>})
    Service->>Backend: PATCH /api/tickets/123
    Backend->>DB: UPDATE status=CERRADO
    DB-->>Backend: Cerrado
    Backend-->>UI: Finalizado
```

## 3. Diagrama de Estados del Ticket

```mermaid
stateDiagram-v2
    [*] --> Abierto: Usuario crea ticket

    Abierto --> EnProgreso: Soporte se asigna<br/>y comienza trabajo

    EnProgreso --> Resuelto: Soporte marca<br/>como resuelto<br/>(requiere solución)

    Resuelto --> Cerrado: Usuario confirma<br/>o cierre automático

    EnProgreso --> Abierto: Reapertura<br/>(problema persiste)
    Resuelto --> EnProgreso: Reapertura<br/>(solución no funcionó)
    Cerrado --> Abierto: Reapertura<br/>(problema recurrió)

    Cerrado --> [*]: Archivar

    note right of Abierto
        Estado: abierto
        Asignado: null o asignado
        Color: Azul
        Acción: Esperando atención
    end note

    note right of EnProgreso
        Estado: en_progreso
        Asignado: Soporte específico
        Color: Amarillo
        Acción: Trabajando en solución
    end note

    note right of Resuelto
        Estado: resuelto
        Solución: Texto requerido
        resolvedAt: Timestamp
        Color: Verde
        Acción: Esperando confirmación
    end note

    note right of Cerrado
        Estado: cerrado
        Color: Gris
        Acción: Finalizado
    end note
```

## 4. Arquitectura del Módulo de Tickets

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        Page[📄 tickets/page.tsx]
        List[📋 TicketList]
        Form[📝 TicketForm]
        Detail[🔍 TicketDetail]

        Service[🔧 tickets.service.ts]
        MockData[💾 Mock Data<br/>mockTickets<br/>mockComments]
    end

    subgraph "Estado Actual"
        Note1[⚠️ Backend NO implementado]
        Note2[⚠️ Usando datos mock]
        Note3[⚠️ DB schema incompleto]
    end

    subgraph "Backend Pendiente - NestJS"
        Controller[🎮 TicketsController<br/>NO EXISTE]
        TService[⚙️ TicketsService<br/>NO EXISTE]
        DTOs[📋 DTOs<br/>NO EXISTE]

        subgraph "Database"
            Prisma[💾 Prisma ORM]
            DB[(PostgreSQL)]
        end
    end

    Page --> List
    Page --> Form
    Page --> Detail

    List --> Service
    Form --> Service
    Detail --> Service

    Service --> MockData

    Service -.->|Futuro| Controller
    Controller -.->|Futuro| TService
    TService -.->|Futuro| Prisma
    Prisma --> DB

    style Page fill:#e1f5ff
    style Controller fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style TService fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style DTOs fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style Note1 fill:#ffe1e1
    style Note2 fill:#ffe1e1
    style Note3 fill:#ffe1e1
```

## 5. Sistema de Prioridades

```mermaid
graph LR
    subgraph "Niveles de Prioridad"
        P1[🟢 BAJA<br/>Minor issues<br/>Puede esperar]
        P2[🟡 MEDIA<br/>Normal<br/>Default]
        P3[🟠 ALTA<br/>Urgente<br/>Afecta trabajo]
        P4[🔴 CRÍTICA<br/>Sistema caído<br/>Bloqueante]
    end

    subgraph "SLA Sugerido Futuro"
        S1[Respuesta: 48h<br/>Resolución: 7 días]
        S2[Respuesta: 24h<br/>Resolución: 3 días]
        S3[Respuesta: 4h<br/>Resolución: 1 día]
        S4[Respuesta: 1h<br/>Resolución: 4h]
    end

    P1 -.-> S1
    P2 -.-> S2
    P3 -.-> S3
    P4 -.-> S4

    style P1 fill:#d4edda
    style P2 fill:#fff3cd
    style P3 fill:#ffeaa7
    style P4 fill:#f8d7da
```

## 6. Sistema de Categorías

```mermaid
mindmap
  root((Categorías<br/>de Tickets))
    Hardware
      Computadoras
      Impresoras
      Periféricos
      Teléfonos
    Software
      Aplicaciones
      Licencias
      Instalación
      Bugs
    Red
      Internet
      WiFi
      VPN
      Conectividad
    Acceso
      Permisos
      Contraseñas
      Cuentas
      Autenticación
    Otro
      Consultas
      Capacitación
      Solicitudes
```

## 7. Flujo de Filtros y Búsqueda

```mermaid
flowchart TD
    A[Usuario en lista de tickets] --> B{Tipo de usuario?}

    B -->|Usuario normal| C[Ver solo mis tickets<br/>createdBy = userId]
    B -->|Soporte/Admin| D[Ver todos los tickets]

    C --> E[Aplicar filtros]
    D --> E

    E --> F{Filtro de búsqueda?}
    F -->|Sí| G[Buscar en:<br/>- Título<br/>- Descripción<br/>- Nombre solicitante]
    F -->|No| H{Filtro de estado?}

    G --> H
    H -->|Sí| I[Filtrar:<br/>- Abierto<br/>- En Progreso<br/>- Resuelto<br/>- Cerrado]
    H -->|No| J{Filtro de prioridad?}

    I --> J
    J -->|Sí| K[Filtrar:<br/>- Baja<br/>- Media<br/>- Alta<br/>- Crítica]
    J -->|No| L{Filtro de asignación?}

    K --> L
    L -->|Mis tickets| M[assignedTo = userId]
    L -->|Sin asignar| N[assignedTo = null]
    L -->|Todos| O[Sin filtro asignación]

    M --> P[Ordenar por:<br/>createdAt DESC]
    N --> P
    O --> P

    P --> Q[Mostrar en tabla]

    style Q fill:#ccffcc
```

## 8. Modelo de Datos (Actual y Necesario)

```mermaid
erDiagram
    User ||--o{ Ticket : "crea"
    User ||--o{ Ticket : "asignado a"
    Ticket ||--o{ TicketComment : "tiene"
    User ||--o{ TicketComment : "escribe"

    User {
        string id PK
        string email UK
        string name
        enum role
    }

    Ticket {
        string id PK
        string title
        string description
        enum status
        enum priority
        string createdById FK
        string assigneeId FK
        datetime createdAt
        datetime updatedAt
        string category "⚠️ FALTA"
        string solution "⚠️ FALTA"
        datetime resolvedAt "⚠️ FALTA"
    }

    TicketComment {
        string id PK "⚠️ TABLA FALTA"
        string ticketId FK "⚠️ TABLA FALTA"
        string userId FK "⚠️ TABLA FALTA"
        string comment "⚠️ TABLA FALTA"
        boolean isInternal "⚠️ TABLA FALTA"
        datetime createdAt "⚠️ TABLA FALTA"
    }
```

## 9. Sistema de Comentarios

```mermaid
sequenceDiagram
    participant User as 👤 Usuario/Soporte
    participant UI as TicketDetail
    participant Service as tickets.service
    participant Backend as Backend API
    participant DB as Database

    User->>UI: Escribe comentario
    UI->>UI: Validar no vacío

    User->>UI: Click "Agregar Comentario"
    UI->>Service: addComment({<br/>ticketId,<br/>userId,<br/>userName,<br/>userRole,<br/>comment,<br/>isInternal<br/>})

    Service->>Backend: POST /api/tickets/:id/comments
    Backend->>Backend: Validar permisos
    Backend->>DB: INSERT INTO ticket_comments

    DB-->>Backend: Comment created
    Backend-->>Service: Comment object

    Service->>Service: Agregar a mockComments
    Service-->>UI: Success

    UI->>Service: getTicketComments(ticketId)
    Service-->>UI: Comments[]

    UI->>UI: Renderizar comentarios<br/>con metadata:<br/>- Autor<br/>- Role<br/>- Timestamp<br/>- Interno/Público

    Note over User,DB: Comentarios internos solo<br/>visibles para Soporte/Admin
```

## 10. Permisos por Rol

```mermaid
graph TB
    subgraph "Matriz de Permisos"
        direction TB

        subgraph "Usuario Normal"
            U1[✅ Crear tickets]
            U2[✅ Ver mis tickets]
            U3[✅ Agregar comentarios]
            U4[✅ Ver detalles]
            U5[❌ Cambiar estado]
            U6[❌ Asignarse tickets]
            U7[❌ Ver todos tickets]
            U8[❌ Eliminar tickets]
        end

        subgraph "Soporte/Empleado"
            S1[✅ Crear tickets]
            S2[✅ Ver todos tickets]
            S3[✅ Agregar comentarios]
            S4[✅ Ver detalles]
            S5[✅ Cambiar estado]
            S6[✅ Asignarse tickets]
            S7[✅ Marcar como resuelto]
            S8[✅ Filtrar por asignación]
            S9[❌ Eliminar tickets]
        end

        subgraph "Administrador"
            A1[✅ Todas las acciones<br/>de Soporte]
            A2[✅ Eliminar tickets]
            A3[✅ Reasignar tickets]
            A4[✅ Gestión completa]
        end
    end

    style U5 fill:#ffcccc
    style U6 fill:#ffcccc
    style U7 fill:#ffcccc
    style U8 fill:#ffcccc
    style S9 fill:#ffcccc
```

## 11. Integración con Dashboard

```mermaid
flowchart LR
    A[Dashboard] --> B[getDashboardStats]

    B --> C{Calcular métricas}
    C --> D[openTickets:<br/>status = abierto<br/>OR en_progreso]
    C --> E[myTickets:<br/>createdBy = userId<br/>OR assignedTo = userId]

    D --> F[Mostrar en<br/>Stats Card]
    E --> F

    A --> G[getRecentActivity]
    G --> H[Filtrar últimos<br/>3 tickets]
    H --> I[Ordenar por<br/>updatedAt DESC]
    I --> J[Mostrar en<br/>Activity Feed]

    F --> K[Quick Action:<br/>Crear Ticket]
    J --> L[Click ticket →<br/>Navegar a detalle]

    style F fill:#e1f5ff
    style J fill:#e1f5ff
```

## Resumen Técnico

### Estado Actual
- ✅ **Frontend**: 100% funcional con mock data
- ⚠️ **Backend**: NO implementado
- ⚠️ **Database**: Schema básico, falta campos y tabla Comments

### Datos Mock (4 tickets de ejemplo)
```typescript
mockTickets: [
  { id: "1", status: "abierto", priority: "alta", category: "software" },
  { id: "2", status: "en_progreso", priority: "media", category: "hardware" },
  { id: "3", status: "resuelto", priority: "critica", category: "red" },
  { id: "4", status: "cerrado", priority: "baja", category: "acceso" }
]

mockComments: [
  { ticketId: "2", userName: "Juan Pérez", userRole: "empleado" },
  { ticketId: "3", userName: "Juan Pérez", userRole: "empleado" }
]
```

### Campos Faltantes en DB
1. ❌ `category` (enum: hardware, software, red, acceso, otro)
2. ❌ `solution` (text)
3. ❌ `resolvedAt` (timestamp)
4. ❌ Tabla `TicketComment` completa

### Endpoints Necesarios
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets` - Listar con filtros
- `GET /api/tickets/:id` - Detalle
- `PATCH /api/tickets/:id` - Actualizar estado/solución
- `DELETE /api/tickets/:id` - Eliminar (ADMIN)
- `POST /api/tickets/:id/comments` - Agregar comentario
- `GET /api/tickets/:id/comments` - Listar comentarios

### Stack Tecnológico
- **Frontend**: Next.js 14, TypeScript, date-fns
- **Backend Pendiente**: NestJS, Prisma
- **Database**: PostgreSQL
- **UI**: shadcn/ui, Tailwind CSS
