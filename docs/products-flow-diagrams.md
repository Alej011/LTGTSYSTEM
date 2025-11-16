# Diagramas de Flujo - Módulo de Productos

## 1. Diagrama de Casos de Uso

```mermaid
graph TB
    Admin[👤 Administrador]
    Support[👤 Soporte]

    subgraph "Módulo de Productos"
        UC1[Listar Productos]
        UC2[Buscar Productos]
        UC3[Ver Detalles]
        UC4[Crear Producto]
        UC5[Editar Producto]
        UC6[Eliminar Producto]
        UC7[Filtrar por Categoría]
        UC8[Filtrar por Estado]
        UC9[Gestionar Marcas]
        UC10[Gestionar Categorías]
    end

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

    Support --> UC1
    Support --> UC2
    Support --> UC3
    Support --> UC7
    Support --> UC8

    style Admin fill:#ff6b6b
    style Support fill:#4ecdc4
    style UC4 fill:#ffe66d
    style UC5 fill:#ffe66d
    style UC6 fill:#ffe66d
```

## 2. Flujo Completo de Creación de Producto

```mermaid
sequenceDiagram
    actor Admin as 👤 Administrador
    participant UI as ProductForm
    participant Service as products.service
    participant BFF as BFF /api/products
    participant Backend as NestJS Controller
    participant PService as ProductsService
    participant DB as PostgreSQL

    Admin->>UI: Click "Nuevo Producto"
    UI->>Service: getBrands()
    Service->>BFF: GET /api/brands
    BFF->>Backend: GET /api/brands
    Backend->>DB: findMany brands
    DB-->>Backend: Brands[]
    Backend-->>BFF: Brands[]
    BFF-->>Service: Brands[]
    Service-->>UI: Mostrar marcas

    UI->>Service: getCategories()
    Service->>BFF: GET /api/categories
    BFF->>Backend: GET /api/categories
    Backend->>DB: findMany categories
    DB-->>Backend: Categories[]
    Backend-->>BFF: Categories[]
    BFF-->>Service: Categories[]
    Service-->>UI: Mostrar categorías

    Admin->>UI: Completa formulario<br/>(name, sku, price, stock, brand, categories)
    UI->>UI: Validación Zod<br/>CreateProductRequestSchema

    alt Validación exitosa
        UI->>Service: createProduct(productData)
        Service->>BFF: POST /api/products/create<br/>{name, sku, price, stock,<br/>brandId, categoryIds[]}

        BFF->>BFF: Validar Zod schema
        BFF->>Backend: POST /products/create<br/>Authorization: Bearer JWT

        Backend->>Backend: JwtAuthGuard valida token
        Backend->>Backend: RolesGuard verifica ADMIN
        Backend->>Backend: Validar CreateProductDto

        Backend->>PService: create(createProductDto)
        PService->>DB: product.create()<br/>+ nested categories
        DB-->>PService: Producto creado

        PService->>PService: transformProductToDto()<br/>Decimal → number
        PService-->>Backend: ProductResponseDto

        Backend-->>BFF: ProductResponseDto
        BFF->>BFF: Validar respuesta Zod
        BFF-->>Service: Product
        Service-->>UI: Product creado

        UI->>UI: onSuccess()
        UI-->>Admin: Volver a lista<br/>Mostrar producto nuevo
    else Validación fallida
        UI-->>Admin: Mostrar errores
    end
```

## 3. Arquitectura del Módulo de Productos

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        Page[📄 products/page.tsx]
        List[📦 ProductList]
        Form[📝 ProductForm]
        Detail[👁️ ProductDetailModal]

        QHooks[⚡ React Query Hooks]
        Service[🔧 products.service.ts]
        Schemas[✅ product.schema.ts]
        Perms[🔐 permissions.ts]
    end

    subgraph "BFF - Next.js API Routes"
        ListRoute[GET /api/products/list]
        CreateRoute[POST /api/products/create]
        DetailRoute[GET /api/products/:id]
        UpdateRoute[PATCH /api/products/:id]
        DeleteRoute[DELETE /api/products/:id]
        BrandsRoute[GET /api/brands]
        CategoriesRoute[GET /api/categories]
    end

    subgraph "Backend - NestJS"
        Controller[🎮 ProductsController]
        PService2[⚙️ ProductsService]
        DTOs[📋 DTOs]
        Guards[🛡️ Guards]

        subgraph "Database"
            Prisma[💾 Prisma ORM]
            DB2[(PostgreSQL)]
        end
    end

    Page --> List
    Page --> Form
    List --> Detail

    List --> QHooks
    Form --> QHooks
    Detail --> QHooks

    QHooks --> Service
    Service --> Schemas
    Service --> Perms

    Service --> ListRoute
    Service --> CreateRoute
    Service --> DetailRoute
    Service --> UpdateRoute
    Service --> DeleteRoute
    Service --> BrandsRoute
    Service --> CategoriesRoute

    ListRoute --> Controller
    CreateRoute --> Controller
    DetailRoute --> Controller
    UpdateRoute --> Controller
    DeleteRoute --> Controller
    BrandsRoute --> Controller
    CategoriesRoute --> Controller

    Controller --> Guards
    Guards --> PService2
    PService2 --> DTOs
    PService2 --> Prisma
    Prisma --> DB2

    style Page fill:#e1f5ff
    style Controller fill:#ffe1e1
    style DB2 fill:#f0f0f0
```

## 4. Modelo de Datos

```mermaid
erDiagram
    Product ||--|| Brand : "pertenece a"
    Product }o--o{ Category : "tiene"
    ProductCategory }o--|| Product : "referencia"
    ProductCategory }o--|| Category : "referencia"

    Product {
        string id PK
        string name
        string description
        string sku UK
        decimal price
        int stock
        enum status
        string brandId FK
        datetime createdAt
        datetime updatedAt
    }

    Brand {
        string id PK
        string name UK
        string description
        datetime createdAt
        datetime updatedAt
    }

    Category {
        string id PK
        string name UK
        string description
        datetime createdAt
        datetime updatedAt
    }

    ProductCategory {
        string productId PK,FK
        string categoryId PK,FK
    }
```

## 5. Flujo de Actualización de Producto

```mermaid
flowchart TD
    A[Admin click Editar] --> B[ProductForm carga<br/>con datos existentes]
    B --> C[Cargar Brands y Categories]
    C --> D[Admin modifica campos]
    D --> E{Validación Zod}

    E -->|Error| F[Mostrar errores]
    E -->|OK| G[updateProduct id, data]

    G --> H[PATCH /api/products/:id]
    H --> I[BFF valida y limpia data]
    I --> J[Backend valida JWT + Role]

    J --> K{Es ADMIN?}
    K -->|No| L[403 Forbidden]
    K -->|Sí| M[ProductsService.update]

    M --> N{categoryIds cambió?}
    N -->|Sí| O[Eliminar ProductCategory<br/>existentes]
    O --> P[Crear nuevas relaciones]
    N -->|No| P

    P --> Q[Actualizar campos<br/>del producto]
    Q --> R[Guardar en DB]
    R --> S[transformProductToDto]
    S --> T[Retornar producto<br/>actualizado]

    T --> U[React Query<br/>invalida cache]
    U --> V[Actualizar UI]
    V --> W[Volver a lista]

    L --> X[Mostrar error]

    style K fill:#fff4e1
    style L fill:#ffcccc
    style V fill:#ccffcc
```

## 6. Sistema de Filtros y Búsqueda

```mermaid
flowchart LR
    A[Usuario ingresa búsqueda] --> B[Frontend construye<br/>query params]

    B --> C{Tiene filtros?}
    C -->|search| D[Agregar ?search=...]
    C -->|category| E[Agregar &category=...]
    C -->|status| F[Agregar &status=...]
    C -->|brandId| G[Agregar &brandId=...]
    C -->|pagination| H[Agregar &page=...&limit=...]

    D --> I[GET /api/products/list]
    E --> I
    F --> I
    G --> I
    H --> I

    I --> J[Backend construye<br/>Prisma WHERE clause]

    J --> K{search?}
    K -->|Sí| L[OR name, sku,<br/>brand.name LIKE]
    K -->|No| M[No filter]

    L --> N{category?}
    M --> N
    N -->|Sí| O[categories.some<br/>name equals]
    N -->|No| P[No filter]

    O --> Q{status?}
    P --> Q
    Q -->|Sí| R[status equals]
    Q -->|No| S[No filter]

    R --> T[Ejecutar queries paralelas]
    S --> T
    T --> U[count + findMany]
    U --> V[Retornar paginado]

    V --> W[Frontend actualiza tabla]

    style W fill:#ccffcc
```

## 7. Permisos por Rol

```mermaid
graph TB
    subgraph "Roles del Sistema"
        Admin[👤 ADMIN]
        Support[👤 SUPPORT empleado]
    end

    subgraph "Permisos de Productos"
        View[👁️ Ver Lista]
        Details[📋 Ver Detalles]
        Create[➕ Crear]
        Edit[✏️ Editar]
        Delete[🗑️ Eliminar]
    end

    Admin -.->|✅ Permitido| View
    Admin -.->|✅ Permitido| Details
    Admin -.->|✅ Permitido| Create
    Admin -.->|✅ Permitido| Edit
    Admin -.->|✅ Permitido| Delete

    Support -.->|✅ Permitido| View
    Support -.->|✅ Permitido| Details
    Support -.->|❌ Denegado| Create
    Support -.->|❌ Denegado| Edit
    Support -.->|❌ Denegado| Delete

    style Admin fill:#ff6b6b
    style Support fill:#4ecdc4
    style Create fill:#ffe66d
    style Edit fill:#ffe66d
    style Delete fill:#ffe66d
```

## 8. Estados de Producto

```mermaid
stateDiagram-v2
    [*] --> Active: Crear producto

    Active --> Inactive: Desactivar
    Inactive --> Active: Reactivar

    Active --> Discontinued: Descontinuar
    Inactive --> Discontinued: Descontinuar

    Discontinued --> [*]: Eliminar (soft/hard)

    note right of Active
        Producto disponible
        Visible en catálogo
        Stock activo
    end note

    note right of Inactive
        Producto oculto
        No visible en catálogo
        Mantiene stock
    end note

    note right of Discontinued
        Producto descontinuado
        No reordenable
        Solo consulta histórica
    end note
```

## 9. Gestión de Cache (React Query)

```mermaid
flowchart TD
    A[Componente monta] --> B{Hay cache?}

    B -->|Sí| C{Cache fresco?<br/>Menos de 2 min}
    B -->|No| D[Fetch data]

    C -->|Sí| E[Usar cache]
    C -->|No| F[Fetch en background]

    F --> G[Actualizar cache]
    D --> G

    G --> H[Render UI]
    E --> H

    H --> I[Usuario interactúa]

    I --> J{Tipo de acción?}
    J -->|Create| K[useCreateProduct]
    J -->|Update| L[useUpdateProduct]
    J -->|Delete| M[useDeleteProduct]

    K --> N[Optimistic update]
    L --> N
    M --> N

    N --> O[API call]
    O --> P{Success?}

    P -->|Sí| Q[Invalidar queries:<br/>- products lists<br/>- product detail]
    P -->|No| R[Rollback<br/>optimistic update]

    Q --> S[Refetch automático]
    S --> T[UI actualizada]

    R --> U[Mostrar error]

    style E fill:#ccffcc
    style T fill:#ccffcc
    style U fill:#ffcccc
```

## Resumen Técnico

### Stack Tecnológico
- **Frontend**: Next.js 14, React Query, Zod, TypeScript
- **BFF**: Next.js API Routes
- **Backend**: NestJS, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT (15 min expiry)

### Características Clave
1. ✅ CRUD completo con validación en 3 capas
2. ✅ Relaciones Many-to-One (Brand) y Many-to-Many (Categories)
3. ✅ Sistema de permisos basado en roles
4. ✅ Búsqueda y filtros avanzados
5. ✅ Paginación server-side
6. ✅ Cache inteligente con React Query
7. ✅ Índices de base de datos para performance
8. ✅ Transformación de tipos (Decimal → number)

### Endpoints Backend
- `GET /api/products/list` - Lista paginada con filtros
- `GET /api/products/detail/:id` - Detalle de producto
- `POST /api/products/create` - Crear (ADMIN)
- `PATCH /api/products/update/:id` - Actualizar (ADMIN)
- `DELETE /api/products/delete/:id` - Eliminar (ADMIN)
- `GET /api/brands` - Lista de marcas
- `GET /api/categories` - Lista de categorías
