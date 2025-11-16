# Diagramas de Flujo - Módulo de Comunicaciones

## 1. Diagrama de Casos de Uso

```mermaid
graph TB
    Admin[👑 Administrador]
    Support[👨‍💻 Soporte]
    User[👤 Empleado]

    subgraph "Módulo de Comunicaciones"
        direction TB

        subgraph "Lectura Todos"
            UC1[Ver Comunicaciones]
            UC2[Buscar Comunicaciones]
            UC3[Filtrar por Tipo]
            UC4[Ver Detalle Completo]
            UC5[Marcar como Leído]
            UC6[Ver No Leídas]
        end

        subgraph "Gestión ADMIN"
            UC7[Crear Comunicación]
            UC8[Editar Comunicación]
            UC9[Eliminar Comunicación]
            UC10[Gestionar Visibilidad]
            UC11[Publicar para Roles]
            UC12[Publicar para Departamentos]
            UC13[Ver Estadísticas Lectura]
        end
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    Support --> UC1
    Support --> UC2
    Support --> UC3
    Support --> UC4
    Support --> UC5
    Support --> UC6

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13

    style User fill:#a8dadc
    style Support fill:#457b9d
    style Admin fill:#e63946
    style UC7 fill:#ffe66d
    style UC8 fill:#ffe66d
    style UC9 fill:#ffe66d
```

## 2. Tipos de Comunicaciones

```mermaid
graph LR
    subgraph "Tipos de Comunicación"
        T1[📢 Anuncio<br/>General announcements<br/>Color: Azul]
        T2[📋 Política<br/>Company policies<br/>Color: Morado]
        T3[📅 Evento<br/>Events & meetings<br/>Color: Verde]
        T4[⚠️ Urgente<br/>Critical alerts<br/>Color: Rojo]
        T5[📝 General<br/>Otras comunicaciones<br/>Color: Gris]
    end

    subgraph "Uso Recomendado"
        U1[Noticias empresariales<br/>Logros del equipo]
        U2[Nuevas políticas<br/>Cambios regulatorios]
        U3[Reuniones<br/>Capacitaciones<br/>Celebraciones]
        U4[Emergencias<br/>Downtime<br/>Seguridad]
        U5[Recordatorios<br/>Avisos varios]
    end

    T1 -.-> U1
    T2 -.-> U2
    T3 -.-> U3
    T4 -.-> U4
    T5 -.-> U5

    style T1 fill:#dbeafe
    style T2 fill:#e9d5ff
    style T3 fill:#d1fae5
    style T4 fill:#fee2e2
    style T5 fill:#e5e7eb
```

## 3. Flujo de Creación de Comunicación

```mermaid
sequenceDiagram
    actor Admin as 👑 Administrador
    participant UI as CommunicationForm
    participant Service as communications.service
    participant Backend as Backend API
    participant DB as Database
    participant Users as Sistema de Usuarios

    Admin->>UI: Click "Nueva Comunicación"
    UI->>Admin: Formulario vacío

    Admin->>UI: Completa:<br/>- Título<br/>- Contenido Markdown<br/>- Tipo<br/>- targetRoles[]<br/>- targetDepartments[]<br/>- Fecha publicación

    Note over Admin,UI: Markdown soportado:<br/># Headers<br/>**Bold**<br/>- Lists<br/>```code```

    Admin->>UI: Submit formulario

    UI->>UI: Validación:<br/>✅ Título requerido<br/>✅ Contenido requerido<br/>✅ Tipo seleccionado<br/>✅ Al menos 1 target

    alt Validación exitosa
        UI->>Service: createCommunication({<br/>title, content, type,<br/>targetRoles, targetDepartments,<br/>authorId, publishedAt<br/>})

        Service->>Backend: POST /api/communications<br/>Authorization: Bearer JWT

        Backend->>Backend: Validar permisos<br/>(ADMIN only)

        Backend->>DB: INSERT INTO communications

        DB-->>Backend: Comunicación creada

        Backend->>Users: Obtener usuarios que<br/>coinciden con filtros:<br/>- role in targetRoles<br/>- department in targetDepartments

        Users-->>Backend: Lista de usuarios

        Backend->>DB: CREATE notification<br/>records for each user

        DB-->>Backend: Notificaciones creadas

        Backend-->>Service: Communication object

        Service-->>UI: Success

        UI->>UI: onSuccess()
        UI-->>Admin: Volver a lista<br/>Comunicación visible

    else Validación fallida
        UI-->>Admin: Mostrar errores
    end
```

## 4. Sistema de Filtrado de Audiencia

```mermaid
flowchart TD
    A[Admin crea comunicación] --> B{Seleccionar audiencia}

    B --> C[targetRoles]
    B --> D[targetDepartments]

    C --> E{Roles seleccionados?}
    E -->|Todos| F[roles: 'all']
    E -->|Específicos| G[roles: ['admin', 'empleado']]

    D --> H{Departamentos?}
    H -->|Todos| I[departments: 'all']
    H -->|Específicos| J[departments: ['TI', 'RRHH', 'Ventas']]

    F --> K[Combinar filtros<br/>con AND logic]
    G --> K
    I --> K
    J --> K

    K --> L{Cuando usuario<br/>consulta comunicaciones}

    L --> M[Filtrar:<br/>- role in targetRoles<br/>OR targetRoles = 'all']

    M --> N[Filtrar:<br/>- department in targetDepartments<br/>OR targetDepartments = 'all']

    N --> O[Retornar comunicaciones<br/>relevantes para usuario]

    O --> P[Mostrar en lista]

    style P fill:#ccffcc
```

## 5. Arquitectura del Módulo

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        Page[📄 communications/page.tsx]
        List[📋 CommunicationList]
        Form[📝 CommunicationForm]
        Viewer[👁️ CommunicationViewer]

        Service[🔧 communications.service.ts]
        MockData[💾 Mock Data<br/>mockCommunications<br/>mockReadStatus]

        Markdown[📝 ReactMarkdown]
    end

    subgraph "Estado Actual"
        Note1[⚠️ Backend NO implementado]
        Note2[⚠️ Mock data con 5 ejemplos]
        Note3[⚠️ DB sin tablas]
    end

    subgraph "Backend Pendiente"
        Controller[🎮 CommunicationsController<br/>NO EXISTE]
        CService[⚙️ CommunicationsService<br/>NO EXISTE]
        DTOs[📋 DTOs<br/>NO EXISTE]

        subgraph "Database"
            Prisma[💾 Prisma ORM]
            DB[(PostgreSQL)]
        end
    end

    Page --> List
    Page --> Form
    Page --> Viewer

    List --> Service
    Form --> Service
    Viewer --> Service

    Viewer --> Markdown

    Service --> MockData

    Service -.->|Futuro| Controller
    Controller -.->|Futuro| CService
    CService -.->|Futuro| Prisma
    Prisma --> DB

    style Page fill:#e1f5ff
    style Controller fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style CService fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style DTOs fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style Note1 fill:#ffe1e1
    style Note2 fill:#ffe1e1
    style Note3 fill:#ffe1e1
```

## 6. Flujo de Lectura de Comunicaciones

```mermaid
sequenceDiagram
    actor User as 👤 Empleado
    participant List as CommunicationList
    participant Viewer as CommunicationViewer
    participant Service as communications.service
    participant Backend as Backend API
    participant DB as Database

    User->>List: Abre página Comunicaciones

    List->>Service: getCommunications(<br/>userRole,<br/>userDepartment<br/>)

    Service->>Backend: GET /api/communications?<br/>role=empleado&<br/>department=TI

    Backend->>DB: SELECT communications<br/>WHERE<br/>(targetRoles CONTAINS role<br/>OR targetRoles = 'all')<br/>AND<br/>(targetDepartments CONTAINS dept<br/>OR targetDepartments = 'all')

    DB-->>Backend: Filtered communications

    Backend->>Service: Communications[]

    Service->>Service: Filtrar mock data<br/>por rol y departamento

    Service-->>List: Communications[]

    List->>Service: getUnreadCount(userId)

    Service->>Backend: GET /api/communications/<br/>unread?userId=X

    Backend->>DB: SELECT COUNT(*)<br/>FROM communications c<br/>WHERE NOT EXISTS (<br/>  SELECT 1 FROM communication_reads r<br/>  WHERE r.communicationId = c.id<br/>  AND r.userId = userId<br/>)

    DB-->>Backend: Count

    Backend-->>Service: unreadCount

    Service-->>List: Mostrar badge: X no leídas

    User->>List: Click en comunicación

    List->>Viewer: Abrir detalle

    Viewer->>Service: markAsRead(<br/>communicationId,<br/>userId<br/>)

    Service->>Backend: POST /api/communications/:id/read

    Backend->>DB: INSERT INTO communication_reads<br/>(communicationId, userId, readAt)<br/>ON CONFLICT DO NOTHING

    DB-->>Backend: Marked as read

    Backend-->>Service: Success

    Service->>Service: Actualizar mockReadStatus

    Service-->>Viewer: Actualizado

    Viewer->>Viewer: Renderizar Markdown

    Viewer-->>User: Mostrar contenido completo
```

## 7. Sistema de Estado de Lectura

```mermaid
stateDiagram-v2
    [*] --> NoLeída: Comunicación creada<br/>Usuario target

    NoLeída --> Leída: Usuario abre<br/>detalle

    Leída --> [*]: Registro persiste

    note right of NoLeída
        Estado inicial
        Badge rojo en lista
        Contador de no leídas
        isRead() = false
    end note

    note right of Leída
        markAsRead() llamado
        Sin badge
        Contador decrementado
        isRead() = true
        Timestamp guardado
    end note
```

## 8. Búsqueda y Filtrado

```mermaid
flowchart TD
    A[Usuario en lista] --> B[Aplicar filtros<br/>automáticos de audiencia]

    B --> C[Filtrar por rol<br/>y departamento]

    C --> D{Usuario ingresa<br/>búsqueda?}

    D -->|Sí| E[Buscar en:<br/>- title.toLowerCase<br/>- content.toLowerCase]
    D -->|No| F{Filtro de tipo?}

    E --> F
    F -->|Anuncio| G[type = 'anuncio']
    F -->|Política| H[type = 'politica']
    F -->|Evento| I[type = 'evento']
    F -->|Urgente| J[type = 'urgente']
    F -->|General| K[type = 'general']
    F -->|Todos| L[Sin filtro tipo]

    G --> M[Ordenar por<br/>publishedAt DESC<br/>Más recientes primero]
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M

    M --> N{Hay resultados?}

    N -->|Sí| O[Renderizar cards]
    N -->|No| P[Mensaje: No hay<br/>comunicaciones]

    O --> Q{Usuario tiene<br/>permisos admin?}

    Q -->|Sí| R[Mostrar botones<br/>Editar/Eliminar]
    Q -->|No| S[Solo lectura]

    R --> T[Mostrar lista]
    S --> T

    style T fill:#ccffcc
```

## 9. Modelo de Datos Necesario

```mermaid
erDiagram
    User ||--o{ Communication : "crea"
    Communication ||--o{ CommunicationRead : "tiene lecturas"
    User ||--o{ CommunicationRead : "lee"

    User {
        string id PK
        string name
        string email
        enum role
        string department "⚠️ FALTA EN DB"
    }

    Communication {
        string id PK "⚠️ TABLA FALTA"
        string title "⚠️ TABLA FALTA"
        string content "⚠️ TABLA FALTA"
        enum type "⚠️ TABLA FALTA"
        string[] targetRoles "⚠️ TABLA FALTA"
        string[] targetDepartments "⚠️ TABLA FALTA"
        string authorId FK "⚠️ TABLA FALTA"
        string authorName "⚠️ TABLA FALTA"
        datetime publishedAt "⚠️ TABLA FALTA"
        datetime createdAt "⚠️ TABLA FALTA"
        datetime updatedAt "⚠️ TABLA FALTA"
    }

    CommunicationRead {
        string id PK "⚠️ TABLA FALTA"
        string communicationId FK "⚠️ TABLA FALTA"
        string userId FK "⚠️ TABLA FALTA"
        datetime readAt "⚠️ TABLA FALTA"
    }

    Department {
        string id PK "⚠️ TABLA FALTA"
        string name UK "⚠️ TABLA FALTA"
    }
```

## 10. Integración con Dashboard

```mermaid
flowchart LR
    A[Dashboard] --> B[getDashboardStats]

    B --> C[getCommunications<br/>userRole, userDept]

    C --> D[Filtrar por<br/>audiencia relevante]

    D --> E[Contar total<br/>comunicaciones]

    E --> F[Mostrar en Stats Card:<br/>newCommunications: X]

    A --> G[getRecentActivity]

    G --> H[Filtrar últimas<br/>3 comunicaciones]

    H --> I[Formatear:<br/>- title<br/>- type label<br/>- publishedAt]

    I --> J[Agregar a<br/>Activity Feed]

    J --> K[Ordenar por fecha DESC]

    F --> L[Quick Action:<br/>Ver Comunicaciones]
    K --> L

    L --> M{Usuario click?}
    M -->|Stats| N[Ir a /communications]
    M -->|Activity item| O[Abrir comunicación<br/>específica]

    style F fill:#e1f5ff
    style J fill:#e1f5ff
```

## 11. Permisos por Rol

```mermaid
graph TB
    subgraph "Matriz de Permisos"
        direction TB

        subgraph "Admin"
            A1[✅ Ver todas comunicaciones]
            A2[✅ Crear comunicaciones]
            A3[✅ Editar comunicaciones]
            A4[✅ Eliminar comunicaciones]
            A5[✅ Gestionar audiencia]
            A6[✅ Ver estadísticas lectura]
        end

        subgraph "Soporte/Empleado"
            S1[✅ Ver comunicaciones<br/>de su rol y departamento]
            S2[✅ Buscar comunicaciones]
            S3[✅ Marcar como leído]
            S4[✅ Ver contador no leídas]
            S5[❌ Crear comunicaciones]
            S6[❌ Editar comunicaciones]
            S7[❌ Eliminar comunicaciones]
            S8[❌ Ver todas las estadísticas]
        end
    end

    style A2 fill:#ffe66d
    style A3 fill:#ffe66d
    style A4 fill:#ffe66d
    style S5 fill:#ffcccc
    style S6 fill:#ffcccc
    style S7 fill:#ffcccc
    style S8 fill:#ffcccc
```

## 12. Renderizado de Markdown

```mermaid
flowchart TD
    A[Comunicación con<br/>contenido Markdown] --> B[CommunicationViewer]

    B --> C[ReactMarkdown<br/>component]

    C --> D{Elementos soportados}

    D --> E[# Headings<br/>h1, h2, h3]
    D --> F[**Bold** *Italic*<br/><u>Underline</u>]
    D --> G[- Bullet lists<br/>1. Numbered lists]
    D --> H[```code blocks```]
    D --> I[[Links] Externos]

    E --> J[Render con estilos<br/>personalizados]
    F --> J
    G --> J
    H --> J
    I --> J

    J --> K[Aplicar clases prose<br/>Tailwind]

    K --> L[HTML final renderizado]

    L --> M{Tipo comunicación}

    M -->|Urgente| N[Destacar con borde<br/>y fondo rojo]
    M -->|Evento| O[Destacar con borde<br/>y fondo verde]
    M -->|Otros| P[Estilo normal]

    N --> Q[Mostrar al usuario]
    O --> Q
    P --> Q

    style Q fill:#ccffcc
```

## 13. Audiencia y Targeting

```mermaid
graph TB
    subgraph "Configuración de Audiencia"
        direction TB

        A[Admin crea comunicación]

        subgraph "Por Roles"
            R1[✅ Todos los roles]
            R2[✅ Solo Admins]
            R3[✅ Solo Soporte]
            R4[✅ Múltiples roles]
        end

        subgraph "Por Departamentos"
            D1[✅ Todos los departamentos]
            D2[✅ TI]
            D3[✅ RRHH]
            D4[✅ Ventas]
            D5[✅ Finanzas]
            D6[✅ Operaciones]
            D7[✅ Múltiples departamentos]
        end

        A --> R1
        A --> R2
        A --> R3
        A --> R4
        A --> D1
        A --> D2
        A --> D3
        A --> D4
        A --> D5
        A --> D6
        A --> D7
    end

    subgraph "Filtrado en Lectura"
        F[Usuario consulta]
        F --> G{Coincide con<br/>targetRoles?}
        G -->|Sí| H{Coincide con<br/>targetDepartments?}
        G -->|No| I[No mostrar]
        H -->|Sí| J[Mostrar comunicación]
        H -->|No| I
    end

    R1 --> F
    R2 --> F
    R3 --> F
    R4 --> F
    D1 --> F
    D2 --> F

    style J fill:#ccffcc
    style I fill:#ffcccc
```

## Resumen Técnico

### Estado Actual
- ✅ **Frontend**: 100% funcional con mock data
- ✅ **Markdown**: Renderizado completo
- ✅ **Tipos**: 5 tipos de comunicaciones
- ✅ **Audiencia**: Filtrado por roles y departamentos
- ✅ **Estado lectura**: Sistema de tracking
- ⚠️ **Backend**: NO implementado
- ⚠️ **Database**: Sin tablas

### Datos Mock (5 comunicaciones)
```typescript
mockCommunications: [
  {
    id: "1",
    title: "Nueva política de trabajo remoto",
    type: "politica",
    targetRoles: "all",
    targetDepartments: "all",
    publishedAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Actualización crítica de seguridad",
    type: "urgente",
    targetRoles: ["empleado"],
    targetDepartments: ["TI"],
    publishedAt: "2024-01-10"
  },
  // ... 3 más
]
```

### Tablas Necesarias en DB
1. ❌ `Communication` - Tabla principal
2. ❌ `CommunicationRead` - Estado de lectura
3. ❌ `Department` - Catálogo de departamentos
4. ❌ Campo `department` en tabla `User`

### Endpoints Necesarios
- `GET /api/communications` - Listar filtradas por audiencia
- `GET /api/communications/:id` - Detalle
- `POST /api/communications` - Crear (ADMIN)
- `PATCH /api/communications/:id` - Editar (ADMIN)
- `DELETE /api/communications/:id` - Eliminar (ADMIN)
- `POST /api/communications/:id/read` - Marcar como leída
- `GET /api/communications/unread` - Contador no leídas

### Stack Tecnológico
- **Frontend**: Next.js 14, TypeScript
- **Markdown**: ReactMarkdown
- **UI**: shadcn/ui, Tailwind CSS
- **Backend Pendiente**: NestJS, Prisma
- **Database**: PostgreSQL

### Características Clave
1. ✅ 5 tipos de comunicaciones con colores
2. ✅ Targeting por roles y departamentos
3. ✅ Sistema de lectura con tracking
4. ✅ Contador de no leídas
5. ✅ Búsqueda full-text
6. ✅ Filtros por tipo
7. ✅ Markdown completo
8. ✅ Integración con dashboard
9. ✅ Permisos ADMIN para gestión
10. ✅ UI responsiva y moderna
