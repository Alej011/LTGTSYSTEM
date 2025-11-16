# Diagramas de Flujo - Módulo de Base de Conocimientos

## 1. Diagrama de Casos de Uso

```mermaid
graph TB
    Admin[👑 Administrador]
    Support[👨‍💻 Soporte]
    User[👤 Usuario]

    subgraph "Base de Conocimientos"
        direction TB

        subgraph "Consulta Pública"
            UC1[Buscar Artículos]
            UC2[Explorar por Categoría]
            UC3[Ver Artículo]
            UC4[Valorar Artículo<br/>Útil/No útil]
            UC5[Ver Artículos Relacionados]
        end

        subgraph "Gestión ADMIN"
            UC6[Crear Artículo]
            UC7[Editar Artículo]
            UC8[Publicar/Despublicar]
            UC9[Archivar Artículo]
            UC10[Gestionar Tags]
            UC11[Ver Estadísticas]
            UC12[Ver Todos los Estados]
        end
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5

    Support --> UC1
    Support --> UC2
    Support --> UC3
    Support --> UC4
    Support --> UC5

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

    style User fill:#a8dadc
    style Support fill:#457b9d
    style Admin fill:#e63946
    style UC6 fill:#ffe66d
    style UC7 fill:#ffe66d
    style UC8 fill:#ffe66d
```

## 2. Flujo de Creación de Artículo

```mermaid
sequenceDiagram
    actor Admin as 👑 Administrador
    participant UI as ArticleForm
    participant Service as knowledge.service
    participant Backend as Backend API
    participant DB as Database

    Admin->>UI: Click "Nuevo Artículo"
    UI->>Admin: Formulario vacío

    Admin->>UI: Completa:<br/>- Título<br/>- Resumen<br/>- Contenido Markdown<br/>- Categoría<br/>- Tags<br/>- Estado

    Note over Admin,UI: Contenido en Markdown:<br/># Títulos<br/>**Negrita**<br/>- Listas<br/>```code```

    Admin->>UI: Submit formulario

    UI->>UI: Validar campos:<br/>✅ Título no vacío<br/>✅ Resumen no vacío<br/>✅ Contenido no vacío<br/>✅ Categoría seleccionada

    alt Validación exitosa
        UI->>Service: createArticle({<br/>title, summary,<br/>content, category,<br/>tags[], status,<br/>authorId, authorName<br/>})

        Service->>Backend: POST /api/knowledge<br/>Authorization: Bearer JWT

        Backend->>Backend: Validar permisos<br/>(ADMIN only)

        Backend->>DB: INSERT INTO knowledge_articles<br/>VALUES (...)

        alt Estado = "published"
            Backend->>DB: SET publishedAt = NOW()
        else Estado = "draft"
            Backend->>DB: SET publishedAt = NULL
        end

        DB-->>Backend: Artículo creado

        Backend->>Backend: Inicializar contadores:<br/>views = 0<br/>helpful = 0<br/>notHelpful = 0

        Backend-->>Service: Article object
        Service-->>UI: Success

        UI->>UI: onSuccess()
        UI-->>Admin: Volver a vista Browse<br/>Artículo visible si published

    else Validación fallida
        UI-->>Admin: Mostrar errores
    end
```

## 3. Estados del Artículo

```mermaid
stateDiagram-v2
    [*] --> Draft: Crear artículo

    Draft --> Published: Publicar
    Published --> Draft: Despublicar

    Draft --> Archived: Archivar
    Published --> Archived: Archivar

    Archived --> Draft: Restaurar
    Archived --> Published: Restaurar y publicar

    Published --> [*]: Eliminar permanente

    note right of Draft
        Estado: draft
        Visible: Solo admin
        En gestión
        publishedAt: null
    end note

    note right of Published
        Estado: published
        Visible: Todos
        Público
        publishedAt: timestamp
    end note

    note right of Archived
        Estado: archived
        Visible: Solo admin
        Histórico
        Preservado
    end note
```

## 4. Arquitectura del Módulo

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        Page[📄 knowledge/page.tsx]
        List[📋 ArticleList]
        Form[📝 ArticleForm]
        Viewer[👁️ ArticleViewer]

        Service[🔧 knowledge.service.ts]
        MockData[💾 Mock Data<br/>mockArticles<br/>mockRatings]

        Markdown[📝 ReactMarkdown]
    end

    subgraph "Estado Actual"
        Note1[⚠️ Backend NO implementado]
        Note2[⚠️ Mock data 4 artículos]
        Note3[⚠️ DB schema incompleto]
    end

    subgraph "Backend Pendiente"
        Controller[🎮 KnowledgeController<br/>NO EXISTE]
        KService[⚙️ KnowledgeService<br/>NO EXISTE]
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
    Controller -.->|Futuro| KService
    KService -.->|Futuro| Prisma
    Prisma --> DB

    style Page fill:#e1f5ff
    style Controller fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style KService fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style DTOs fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style Note1 fill:#ffe1e1
    style Note2 fill:#ffe1e1
    style Note3 fill:#ffe1e1
```

## 5. Sistema de Categorías

```mermaid
mindmap
  root((Categorías<br/>Knowledge Base))
    Hardware
      ::icon(fa fa-server)
      Computadoras
      Impresoras
      Periféricos
      Mantenimiento
    Software
      ::icon(fa fa-laptop)
      Aplicaciones
      SO Windows
      SO macOS
      Licencias
    Red
      ::icon(fa fa-network-wired)
      Internet
      WiFi
      VPN
      Firewall
    Acceso
      ::icon(fa fa-key)
      Permisos
      Contraseñas
      Active Directory
      SSO
    Procedimientos
      ::icon(fa fa-file-alt)
      Onboarding
      Políticas
      Guías paso a paso
      Best practices
    FAQ
      ::icon(fa fa-question-circle)
      Preguntas frecuentes
      Troubleshooting
      Quick fixes
```

## 6. Flujo de Búsqueda y Filtrado

```mermaid
flowchart TD
    A[Usuario en KB] --> B{Modo de vista?}

    B -->|Browse| C[Ver solo PUBLISHED]
    B -->|Manage ADMIN| D[Ver TODOS los estados]

    C --> E[Usuario ingresa búsqueda]
    D --> E

    E --> F{Hay término búsqueda?}

    F -->|Sí| G[Buscar en:<br/>- title.toLowerCase<br/>- content.toLowerCase<br/>- summary.toLowerCase<br/>- tags array]
    F -->|No| H{Filtro categoría?}

    G --> H
    H -->|Sí| I[Filtrar por category]
    H -->|No| J{Filtro estado?<br/>ADMIN}

    I --> J
    J -->|Sí| K[Filtrar por status]
    J -->|No| L[Ordenar por views DESC<br/>Popularidad]

    K --> L

    L --> M[Renderizar grid cards]

    M --> N{Hay resultados?}
    N -->|Sí| O[Mostrar artículos]
    N -->|No| P[Mensaje: No se<br/>encontraron artículos]

    style O fill:#ccffcc
    style P fill:#fff4e1
```

## 7. Sistema de Valoración

```mermaid
sequenceDiagram
    actor User as 👤 Usuario
    participant Viewer as ArticleViewer
    participant Service as knowledge.service
    participant Backend as Backend API
    participant DB as Database

    User->>Viewer: Lee artículo completo
    Viewer->>User: Mostrar botones:<br/>¿Fue útil?<br/>[Sí] [No]

    User->>Viewer: Click "Sí, fue útil"

    Viewer->>Service: rateArticle(<br/>articleId,<br/>userId,<br/>isHelpful: true<br/>)

    Service->>Backend: POST /api/knowledge/:id/rate<br/>{userId, isHelpful}

    Backend->>DB: SELECT rating<br/>WHERE articleId AND userId

    alt Usuario ya valoró antes
        DB-->>Backend: Rating existente

        Backend->>DB: UPDATE article_ratings<br/>SET isHelpful = true

        Backend->>DB: Actualizar contadores:<br/>- Restar del anterior<br/>- Sumar al nuevo

    else Primera valoración
        DB-->>Backend: No existe

        Backend->>DB: INSERT INTO article_ratings<br/>(articleId, userId, isHelpful)

        Backend->>DB: UPDATE knowledge_articles<br/>SET helpful = helpful + 1
    end

    DB-->>Backend: Actualizado

    Backend-->>Service: Success
    Service-->>Viewer: Actualizar UI

    Viewer->>Viewer: setHasRated(true)
    Viewer->>Viewer: Deshabilitar botones

    Viewer-->>User: Gracias por tu valoración<br/>Mostrar contador actualizado

    Note over Viewer,DB: Ratio de utilidad:<br/>helpful / (helpful + notHelpful)
```

## 8. Modelo de Datos (Actual vs Necesario)

```mermaid
erDiagram
    User ||--o{ KnowledgeArticle : "escribe"
    KnowledgeArticle ||--o{ ArticleRating : "tiene valoraciones"
    User ||--o{ ArticleRating : "valora"
    KnowledgeArticle }o--o{ Ticket : "relacionado con"

    User {
        string id PK
        string name
        string email
    }

    KnowledgeArticle {
        string id PK
        string title
        string content "Markdown"
        string summary
        enum category
        string[] tags
        enum status
        string authorId FK
        string authorName
        int views
        int helpful
        int notHelpful
        string relatedTicketId FK "NULLABLE"
        datetime publishedAt "NULLABLE"
        datetime createdAt
        datetime updatedAt
    }

    ArticleRating {
        string id PK "⚠️ TABLA FALTA"
        string articleId FK "⚠️ TABLA FALTA"
        string userId FK "⚠️ TABLA FALTA"
        boolean isHelpful "⚠️ TABLA FALTA"
        datetime createdAt "⚠️ TABLA FALTA"
    }

    Ticket {
        string id PK
        string title
    }
```

## 9. Renderizado de Markdown

```mermaid
flowchart LR
    A[Artículo con<br/>contenido Markdown] --> B[ArticleViewer]

    B --> C[ReactMarkdown<br/>component]

    C --> D{Tipo de elemento?}

    D -->|Heading| E[Custom h1, h2, h3<br/>con estilos]
    D -->|Paragraph| F[Párrafos con<br/>line-height]
    D -->|List| G[Listas numeradas<br/>y bullets]
    D -->|Code| H[Bloques de código<br/>con syntax highlight]
    D -->|Link| I[Enlaces externos]
    D -->|Image| J[Imágenes responsive]

    E --> K[HTML renderizado]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L[Mostrar en UI<br/>con estilos prose]

    style K fill:#e1f5ff
    style L fill:#ccffcc
```

## 10. Incremento de Vistas

```mermaid
sequenceDiagram
    participant User as 👤 Usuario
    participant List as ArticleList
    participant Viewer as ArticleViewer
    participant Service as knowledge.service
    participant Backend as Backend API
    participant DB as Database

    User->>List: Click en card artículo
    List->>Viewer: Abrir article ID

    Viewer->>Service: getArticleById(id)
    Service->>Backend: GET /api/knowledge/:id
    Backend->>DB: SELECT article WHERE id
    DB-->>Backend: Article
    Backend-->>Service: Article
    Service-->>Viewer: Article data

    Viewer->>Viewer: Renderizar contenido

    Note over Viewer,Service: Auto-incremento de vistas

    Viewer->>Service: incrementViews(articleId)

    Service->>Backend: PATCH /api/knowledge/:id/view

    Backend->>DB: UPDATE knowledge_articles<br/>SET views = views + 1<br/>WHERE id = ?

    DB-->>Backend: Updated

    Backend-->>Service: New view count

    Service->>Service: Actualizar mockArticles<br/>article.views++

    Service-->>Viewer: Success

    Note over User,DB: Vista contabilizada<br/>para estadísticas
```

## 11. Artículos Relacionados

```mermaid
flowchart TD
    A[Usuario ve artículo] --> B[ArticleViewer carga]

    B --> C[Obtener tags<br/>del artículo actual]

    C --> D[Buscar otros artículos<br/>con tags similares]

    D --> E{Hay coincidencias?}

    E -->|Sí| F[Calcular relevancia:<br/>count tags compartidos]

    F --> G[Ordenar por<br/>mayor coincidencia]

    G --> H[Tomar top 3<br/>artículos relacionados]

    H --> I[Excluir artículo actual]

    I --> J[Mostrar en sidebar<br/>Artículos Relacionados]

    E -->|No| K[No mostrar<br/>sección relacionados]

    J --> L{Usuario click<br/>artículo relacionado?}

    L -->|Sí| M[Navegar a<br/>nuevo artículo]

    M --> A

    style J fill:#ccffcc
```

## 12. Integración con Dashboard

```mermaid
flowchart LR
    A[Dashboard] --> B[getDashboardStats]

    B --> C[getArticles 'published']

    C --> D[Contar artículos<br/>publicados]

    D --> E[Mostrar en Stats Card:<br/>knowledgeArticles: X]

    A --> F[getRecentActivity]

    F --> G[Obtener últimos<br/>2 artículos publicados]

    G --> H[Formatear:<br/>- title<br/>- authorName<br/>- category<br/>- updatedAt]

    H --> I[Agregar a<br/>Activity Feed]

    I --> J[Ordenar por fecha<br/>DESC]

    E --> K[Quick Action:<br/>Ver Knowledge Base]
    J --> K

    K --> L{Usuario click?}
    L -->|Stats| M[Ir a /knowledge]
    L -->|Activity item| N[Ir a artículo específico]

    style E fill:#e1f5ff
    style I fill:#e1f5ff
```

## 13. Gestión de Tags

```mermaid
flowchart TD
    A[Admin en ArticleForm] --> B[Input tags]

    B --> C[Usuario escribe tag]

    C --> D[Presiona Enter<br/>o botón Agregar]

    D --> E{Tag ya existe?}

    E -->|Sí| F[Ignorar duplicado<br/>Mostrar mensaje]
    E -->|No| G[Agregar a array tags]

    G --> H[Mostrar badge<br/>con botón X]

    H --> I{Usuario click X?}

    I -->|Sí| J[Remover tag<br/>del array]
    I -->|No| K[Mantener tag]

    J --> L{Quedan tags?}
    K --> L

    L -->|Sí| M[Mostrar lista tags]
    L -->|No| N[Input vacío]

    M --> O[Submit formulario]
    N --> O

    O --> P[Guardar tags array<br/>en artículo]

    style P fill:#ccffcc
```

## Resumen Técnico

### Estado Actual
- ✅ **Frontend**: 100% funcional con mock data
- ✅ **Markdown**: Renderizado completo con ReactMarkdown
- ✅ **Búsqueda**: Full-text search cliente
- ✅ **Valoración**: Sistema helpful/not helpful
- ✅ **Tags**: Gestión dinámica
- ⚠️ **Backend**: NO implementado
- ⚠️ **Database**: Schema básico incompleto

### Datos Mock (4 artículos)
```typescript
mockArticles: [
  {
    id: "1",
    title: "Cómo reiniciar el router de la oficina",
    category: "red",
    tags: ["router", "internet", "conectividad"],
    status: "published",
    views: 45,
    helpful: 12,
    notHelpful: 1
  },
  {
    id: "2",
    title: "Configuración de correo en Outlook",
    category: "software",
    tags: ["outlook", "correo", "email"],
    status: "published",
    views: 78,
    helpful: 25,
    notHelpful: 3
  },
  // ... 2 más
]
```

### Campos Faltantes en DB
1. ❌ `summary` (text)
2. ❌ `category` (enum)
3. ❌ `status` (enum)
4. ❌ `authorId` + `authorName` (FK + string)
5. ❌ `publishedAt` (timestamp nullable)
6. ❌ `views`, `helpful`, `notHelpful` (integers)
7. ❌ `relatedTicketId` (FK nullable)
8. ❌ Tabla `ArticleRating` completa

### Endpoints Necesarios
- `GET /api/knowledge` - Listar artículos con filtros
- `GET /api/knowledge/:id` - Detalle de artículo
- `POST /api/knowledge` - Crear (ADMIN)
- `PATCH /api/knowledge/:id` - Actualizar (ADMIN)
- `DELETE /api/knowledge/:id` - Eliminar (ADMIN)
- `PATCH /api/knowledge/:id/view` - Incrementar vistas
- `POST /api/knowledge/:id/rate` - Valorar artículo

### Stack Tecnológico
- **Frontend**: Next.js 14, TypeScript
- **Markdown**: ReactMarkdown
- **UI**: shadcn/ui, Tailwind CSS
- **Backend Pendiente**: NestJS, Prisma
- **Database**: PostgreSQL

### Características Clave
1. ✅ Markdown completo con syntax highlighting
2. ✅ Sistema de valoración (helpful ratio)
3. ✅ Búsqueda full-text
4. ✅ Categorización y tags
5. ✅ Estados (draft/published/archived)
6. ✅ Artículos relacionados por tags
7. ✅ Contador de vistas
8. ✅ Integración con dashboard
