# Arquitectura del Sistema LTGTSYSTEM

## 1. Arquitectura General de Capas

```mermaid
graph TB
    subgraph "Cliente"
        Browser[🌐 Navegador Web<br/>Chrome, Firefox, Safari]
    end

    subgraph "Frontend - Next.js 14"
        direction TB
        Pages[📄 Pages<br/>App Router]
        Components[🧩 Components<br/>React + shadcn/ui]
        Services[🔧 Services Layer<br/>API Calls]
        ReactQuery[⚡ React Query<br/>State Management]
        Auth[🔐 Auth Context<br/>JWT Management]
        Middleware[🛡️ Middleware<br/>Route Protection]
    end

    subgraph "BFF - Next.js API Routes"
        direction TB
        APIRoutes[🔌 API Routes<br/>/api/*]
        Validation[✅ Zod Validation<br/>Request/Response]
        Transform[🔄 Data Transformation<br/>Backend ↔ Frontend]
        Proxy[📡 Proxy Layer<br/>to Backend]
    end

    subgraph "Backend - NestJS"
        direction TB
        Controllers[🎮 Controllers<br/>HTTP Endpoints]
        Guards[🛡️ Guards<br/>JWT + Roles]
        ServicesB[⚙️ Services<br/>Business Logic]
        DTOs[📋 DTOs<br/>Validation]
        Prisma[💾 Prisma ORM<br/>Type-safe DB]
    end

    subgraph "Base de Datos"
        DB[(🗄️ PostgreSQL<br/>Relational Database)]
    end

    subgraph "Seguridad"
        JWT[🔑 JWT Tokens<br/>15 min expiry]
        Bcrypt[🔒 Bcrypt<br/>Password Hashing]
    end

    Browser --> Pages
    Pages --> Components
    Components --> Services
    Services --> ReactQuery
    Services --> Auth
    Pages --> Middleware

    Services --> APIRoutes
    APIRoutes --> Validation
    Validation --> Transform
    Transform --> Proxy

    Proxy --> Controllers
    Controllers --> Guards
    Guards --> ServicesB
    ServicesB --> DTOs
    ServicesB --> Prisma

    Prisma --> DB

    Auth --> JWT
    Guards --> JWT
    ServicesB --> Bcrypt

    style Browser fill:#e1f5ff
    style Pages fill:#dbeafe
    style APIRoutes fill:#fef3c7
    style Controllers fill:#fee2e2
    style DB fill:#f0f0f0
    style JWT fill:#d1fae5
```

## 2. Arquitectura por Módulos

```mermaid
graph LR
    subgraph "Frontend Next.js"
        subgraph "Módulos Implementados"
            M1[👤 Usuarios<br/>CRUD completo]
            M2[📦 Productos<br/>CRUD + Categorías]
            M3[🎫 Tickets<br/>Soporte técnico]
            M4[📚 Knowledge Base<br/>Artículos]
            M5[📢 Comunicaciones<br/>Anuncios]
            M6[📊 Dashboard<br/>Estadísticas]
        end

        Common[🔧 Shared<br/>- API Client<br/>- Permissions<br/>- JWT Utils]
    end

    subgraph "BFF Next.js API"
        BFF1[/api/users]
        BFF2[/api/products]
        BFF3[/api/tickets]
        BFF4[/api/knowledge]
        BFF5[/api/communications]
        BFF6[/api/auth]
    end

    subgraph "Backend NestJS"
        subgraph "Módulos Backend"
            BE1[UsersModule ✅]
            BE2[ProductsModule ✅]
            BE3[AuthModule ✅]
            BE4[TicketsModule ❌]
            BE5[KnowledgeModule ❌]
            BE6[CommunicationsModule ❌]
        end
    end

    M1 --> BFF1
    M2 --> BFF2
    M3 --> BFF3
    M4 --> BFF4
    M5 --> BFF5
    M1 --> BFF6
    M6 --> BFF1
    M6 --> BFF2
    M6 --> BFF3

    BFF1 --> BE1
    BFF2 --> BE2
    BFF6 --> BE3
    BFF3 -.->|Pendiente| BE4
    BFF4 -.->|Pendiente| BE5
    BFF5 -.->|Pendiente| BE6

    M1 --> Common
    M2 --> Common
    M3 --> Common
    M4 --> Common
    M5 --> Common

    style M1 fill:#d1fae5
    style M2 fill:#d1fae5
    style BE1 fill:#d1fae5
    style BE2 fill:#d1fae5
    style BE3 fill:#d1fae5
    style BE4 fill:#fee2e2
    style BE5 fill:#fee2e2
    style BE6 fill:#fee2e2
```

## 3. Stack Tecnológico Completo

```mermaid
graph TB
    subgraph "Frontend Stack"
        F1[⚛️ React 18<br/>UI Library]
        F2[📦 Next.js 14<br/>App Router + SSR]
        F3[🎨 Tailwind CSS<br/>Utility-first CSS]
        F4[🧩 shadcn/ui<br/>Component Library]
        F5[⚡ React Query<br/>Server State]
        F6[✅ Zod<br/>Schema Validation]
        F7[📝 TypeScript<br/>Type Safety]
        F8[📅 date-fns<br/>Date Utilities]
        F9[📝 ReactMarkdown<br/>Markdown Rendering]
    end

    subgraph "Backend Stack"
        B1[🏗️ NestJS<br/>Node.js Framework]
        B2[💾 Prisma<br/>ORM]
        B3[🔐 Passport JWT<br/>Authentication]
        B4[🔒 bcrypt<br/>Password Hashing]
        B5[✅ class-validator<br/>DTO Validation]
        B6[📋 class-transformer<br/>Data Mapping]
        B7[📝 TypeScript<br/>Type Safety]
    end

    subgraph "Database"
        D1[(PostgreSQL<br/>Relational DB)]
        D2[📊 Migrations<br/>Prisma Migrate]
        D3[🌱 Seeding<br/>Initial Data]
    end

    subgraph "DevOps & Tools"
        T1[📦 pnpm<br/>Package Manager]
        T2[🔧 ESLint<br/>Linting]
        T3[💅 Prettier<br/>Formatting]
        T4[📝 Git<br/>Version Control]
    end

    F2 --> F1
    F2 --> F3
    F4 --> F3
    F2 --> F5
    F2 --> F6
    F2 --> F7
    F2 --> F8
    F2 --> F9

    B1 --> B2
    B1 --> B3
    B1 --> B4
    B1 --> B5
    B1 --> B6
    B1 --> B7

    B2 --> D1
    B2 --> D2
    B2 --> D3

    style F2 fill:#dbeafe
    style B1 fill:#fee2e2
    style D1 fill:#f0f0f0
```

## 4. Flujo de Datos Completo

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant FE as Frontend<br/>Next.js
    participant BFF as BFF<br/>API Routes
    participant BE as Backend<br/>NestJS
    participant DB as PostgreSQL

    Note over U,DB: Ejemplo: Crear Producto

    U->>FE: Click "Nuevo Producto"
    FE->>FE: Render ProductForm
    U->>FE: Completa formulario
    FE->>FE: Validación Zod

    FE->>BFF: POST /api/products/create<br/>+ JWT Token
    BFF->>BFF: Validar Zod Schema
    BFF->>BFF: Transformar datos

    BFF->>BE: POST /products/create<br/>Authorization: Bearer
    BE->>BE: JwtAuthGuard
    BE->>BE: RolesGuard (ADMIN)
    BE->>BE: Validar DTO

    BE->>DB: INSERT product +<br/>categories relation
    DB-->>BE: Product created

    BE->>BE: Transform to DTO
    BE-->>BFF: ProductResponseDto

    BFF->>BFF: Transform roles
    BFF-->>FE: Product (frontend format)

    FE->>FE: React Query<br/>invalidate cache
    FE-->>U: Mostrar producto<br/>en lista
```

## 5. Modelo de Datos Global

```mermaid
erDiagram
    User ||--o{ Ticket : "crea"
    User ||--o{ Ticket : "asignado"
    User ||--o{ Product : "gestiona"
    User ||--o{ KnowledgeArticle : "escribe"
    User ||--o{ Communication : "publica"

    Product ||--|{ Brand : "pertenece"
    Product }o--o{ Category : "tiene"
    ProductCategory }o--|| Product : ""
    ProductCategory }o--|| Category : ""

    Ticket ||--o{ TicketComment : "tiene"
    User ||--o{ TicketComment : "escribe"

    KnowledgeArticle ||--o{ ArticleRating : "tiene"
    User ||--o{ ArticleRating : "valora"

    Communication ||--o{ CommunicationRead : "seguimiento"
    User ||--o{ CommunicationRead : "lee"

    User {
        string id PK
        string email UK
        string password
        string name
        enum role
        datetime createdAt
        datetime updatedAt
    }

    Product {
        string id PK
        string name
        string sku UK
        decimal price
        int stock
        enum status
        string brandId FK
    }

    Brand {
        string id PK
        string name UK
    }

    Category {
        string id PK
        string name UK
    }

    Ticket {
        string id PK
        string title
        string description
        enum status
        enum priority
        string createdById FK
        string assigneeId FK
    }

    TicketComment {
        string id PK
        string ticketId FK
        string userId FK
        string comment
    }

    KnowledgeArticle {
        string id PK
        string title
        string content
        enum category
        enum status
        string authorId FK
    }

    ArticleRating {
        string id PK
        string articleId FK
        string userId FK
        boolean isHelpful
    }

    Communication {
        string id PK
        string title
        string content
        enum type
        string authorId FK
    }

    CommunicationRead {
        string id PK
        string communicationId FK
        string userId FK
        datetime readAt
    }
```

## 6. Sistema de Autenticación y Autorización

```mermaid
graph TB
    subgraph "Proceso de Autenticación"
        L1[Usuario ingresa<br/>email + password]
        L2[Backend valida<br/>con bcrypt]
        L3[Genera JWT<br/>15 min expiry]
        L4[Frontend guarda<br/>localStorage + cookie]
    end

    subgraph "Estructura JWT"
        J1[Payload:<br/>- sub: userId<br/>- role: ADMIN/SUPPORT<br/>- email<br/>- name<br/>- exp: timestamp]
        J2[Firma:<br/>JWT_ACCESS_SECRET]
    end

    subgraph "Protección de Rutas"
        R1[Middleware<br/>Next.js]
        R2[JwtAuthGuard<br/>NestJS]
        R3[RolesGuard<br/>NestJS]
    end

    subgraph "Roles del Sistema"
        ROL1[👑 ADMIN<br/>Acceso completo]
        ROL2[👨‍💻 SUPPORT<br/>Acceso limitado]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4

    L3 --> J1
    L3 --> J2

    L4 --> R1
    J1 --> R2
    R2 --> R3

    R3 --> ROL1
    R3 --> ROL2

    style L3 fill:#d1fae5
    style J1 fill:#fef3c7
    style ROL1 fill:#fee2e2
    style ROL2 fill:#dbeafe
```

## 7. Infraestructura de Desarrollo

```mermaid
graph TB
    subgraph "Repositorio"
        Git[📂 Git Repository<br/>LTGTSYSTEM]

        subgraph "Estructura"
            Frontend[📁 frontend/<br/>Next.js App]
            Backend[📁 backend/<br/>NestJS API]
            Docs[📁 docs/<br/>Documentación]
        end
    end

    subgraph "Desarrollo Local"
        Dev1[💻 Frontend Dev<br/>localhost:3000]
        Dev2[💻 Backend Dev<br/>localhost:4000]
        Dev3[🗄️ PostgreSQL<br/>localhost:5432]
    end

    subgraph "Variables de Entorno"
        E1[🔐 .env Frontend<br/>- NEXT_PUBLIC_API_URL<br/>- JWT_SECRET]
        E2[🔐 .env Backend<br/>- DATABASE_URL<br/>- JWT_ACCESS_SECRET]
    end

    Git --> Frontend
    Git --> Backend
    Git --> Docs

    Frontend --> Dev1
    Backend --> Dev2
    Backend --> Dev3

    Dev1 --> E1
    Dev2 --> E2

    style Git fill:#f0f0f0
    style Dev1 fill:#dbeafe
    style Dev2 fill:#fee2e2
    style Dev3 fill:#d1fae5
```

## 8. Matriz de Estado de Implementación

```mermaid
graph TB
    subgraph "Estado por Módulo"
        direction TB

        M1[✅ Autenticación<br/>Backend + Frontend]
        M2[✅ Usuarios<br/>Backend + Frontend]
        M3[✅ Productos<br/>Backend + Frontend]
        M4[⚠️ Tickets<br/>Frontend only]
        M5[⚠️ Knowledge Base<br/>Frontend only]
        M6[⚠️ Comunicaciones<br/>Frontend only]
        M7[✅ Dashboard<br/>Frontend only]
    end

    subgraph "Componentes Compartidos"
        C1[✅ API Client]
        C2[✅ Permissions System]
        C3[✅ JWT Utils]
        C4[✅ Route Protection]
        C5[✅ Zod Schemas]
    end

    subgraph "Backend Pendiente"
        P1[❌ TicketsModule]
        P2[❌ KnowledgeModule]
        P3[❌ CommunicationsModule]
        P4[⚠️ Campos DB faltantes]
    end

    style M1 fill:#d1fae5
    style M2 fill:#d1fae5
    style M3 fill:#d1fae5
    style M4 fill:#fef3c7
    style M5 fill:#fef3c7
    style M6 fill:#fef3c7
    style M7 fill:#d1fae5
    style P1 fill:#fee2e2
    style P2 fill:#fee2e2
    style P3 fill:#fee2e2
    style P4 fill:#fee2e2
```

## 9. Flujo de Petición HTTP Completo

```mermaid
flowchart LR
    A[👤 Usuario] --> B[React Component]
    B --> C{Autenticado?}

    C -->|No| D[Redirect /login]
    C -->|Sí| E[API Service]

    E --> F[API Client]
    F --> G[Agregar JWT Header]
    G --> H[Llamada HTTP]

    H --> I[Next.js Middleware]
    I --> J{Token válido?}
    J -->|No| K[401 Redirect]
    J -->|Sí| L[BFF API Route]

    L --> M[Validar Zod]
    M --> N[Transformar datos]
    N --> O[Proxy a Backend]

    O --> P[NestJS Controller]
    P --> Q[JwtAuthGuard]
    Q --> R{JWT válido?}
    R -->|No| S[401 Unauthorized]
    R -->|Sí| T[RolesGuard]

    T --> U{Role permitido?}
    U -->|No| V[403 Forbidden]
    U -->|Sí| W[Service]

    W --> X[Prisma Query]
    X --> Y[(PostgreSQL)]
    Y --> Z[Response]

    Z --> AA[Transform DTO]
    AA --> AB[BFF Transform]
    AB --> AC[React Query Cache]
    AC --> AD[UI Update]

    style A fill:#e1f5ff
    style Y fill:#f0f0f0
    style AD fill:#d1fae5
    style K fill:#fee2e2
    style S fill:#fee2e2
    style V fill:#fee2e2
```

## Resumen de Arquitectura

### 🏗️ Patrón de Arquitectura
**BFF (Backend for Frontend)** con separación clara de responsabilidades:
- **Frontend**: UI/UX y estado cliente
- **BFF**: Transformación de datos y proxy
- **Backend**: Lógica de negocio y persistencia

### 🔑 Características Clave

1. **Type Safety End-to-End**
   - TypeScript en Frontend y Backend
   - Zod para validación runtime
   - Prisma para type-safe queries

2. **Seguridad Multi-Capa**
   - JWT con expiración corta (15 min)
   - Bcrypt para passwords (10 rounds)
   - Guards en múltiples niveles
   - RBAC completo

3. **Estado del Cliente**
   - React Query para server state
   - Cache inteligente
   - Optimistic updates
   - Automatic refetching

4. **Validación Triple**
   - Frontend: Formularios
   - BFF: Zod schemas
   - Backend: DTOs + class-validator

### 📊 Métricas del Sistema

- **Líneas de código Frontend**: ~15,000+
- **Líneas de código Backend**: ~5,000+
- **Componentes React**: 30+
- **API Endpoints**: 25+
- **Tablas DB**: 8+ (algunas pendientes)
- **Roles**: 2 (ADMIN, SUPPORT)
- **Módulos**: 6 principales

### 🚀 Stack Resumido

| Capa | Tecnología Principal |
|------|---------------------|
| Frontend | Next.js 14 + React 18 + TypeScript |
| BFF | Next.js API Routes + Zod |
| Backend | NestJS + Prisma + Passport |
| Database | PostgreSQL |
| UI | Tailwind CSS + shadcn/ui |
| State | React Query |
| Auth | JWT + bcrypt |

### ✅ Completado vs ⚠️ Pendiente

**Completado (Backend + Frontend):**
- ✅ Sistema de autenticación
- ✅ Gestión de usuarios
- ✅ Gestión de productos (con marcas y categorías)
- ✅ Dashboard con estadísticas

**Frontend Completo (Backend Pendiente):**
- ⚠️ Sistema de tickets
- ⚠️ Base de conocimientos
- ⚠️ Comunicaciones internas

### 🎯 Próximos Pasos Recomendados

1. Implementar backend de Tickets
2. Implementar backend de Knowledge Base
3. Implementar backend de Comunicaciones
4. Agregar tabla Department
5. Completar campos faltantes en DB
6. Sistema de notificaciones
7. Recuperación de contraseña
8. Logs y auditoría
