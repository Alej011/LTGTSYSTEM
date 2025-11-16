# Diagramas de Flujo - Sistema de Autenticación

Este documento contiene diagramas Mermaid que visualizan el flujo de autenticación del sistema LTGT.

## 1. Flujo Completo de Login (Secuencia)

```mermaid
sequenceDiagram
    actor Usuario
    participant LoginForm as LoginForm<br/>(frontend/components)
    participant AuthContext as AuthContext<br/>(React Context)
    participant ReactQuery as React Query<br/>(useLogin)
    participant BFF as BFF API<br/>(/api/auth/login)
    participant Backend as Backend<br/>(NestJS Auth)
    participant DB as Database<br/>(Prisma)

    Usuario->>LoginForm: Ingresa email/password
    LoginForm->>LoginForm: Validación Zod<br/>(LoginRequestSchema)

    alt Validación exitosa
        LoginForm->>AuthContext: login(email, password)
        AuthContext->>ReactQuery: useLogin.mutate()
        ReactQuery->>BFF: POST /api/auth/login<br/>{email, password}

        BFF->>BFF: Validación Zod
        BFF->>Backend: POST /api/auth/login<br/>(proxy request)

        Backend->>DB: Buscar usuario por email
        DB-->>Backend: Usuario encontrado

        Backend->>Backend: bcrypt.compare()<br/>(verificar password)

        alt Credenciales válidas
            Backend->>Backend: Generar JWT<br/>(15min expiry)<br/>{sub, role, email, name}
            Backend-->>BFF: {accessToken, user}

            BFF->>BFF: Transformar roles<br/>ADMIN→admin<br/>SUPPORT→empleado
            BFF-->>ReactQuery: {accessToken, user}

            ReactQuery->>ReactQuery: Actualizar cache<br/>del usuario
            ReactQuery-->>AuthContext: Success

            AuthContext->>AuthContext: Guardar token<br/>localStorage + cookies
            AuthContext-->>LoginForm: Login exitoso

            LoginForm->>Usuario: Redirect /dashboard
        else Credenciales inválidas
            Backend-->>BFF: Error 401
            BFF-->>ReactQuery: Error
            ReactQuery-->>LoginForm: Mostrar error
        end
    else Validación fallida
        LoginForm->>Usuario: Mostrar errores
    end
```

## 2. Arquitectura de Componentes

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        A[LoginForm Component] -->|useAuth| B[AuthContext]
        B -->|hooks| C[React Query]
        C -->|useLogin| D[Auth Queries]
        C -->|useCurrentUser| D
        D -->|API calls| E[Auth Service]
        E -->|HTTP| F[API Client]
        F -->|JWT interceptor| F

        G[Middleware] -->|verifica JWT| H[Cookies]
        G -->|protege rutas| I[Protected Routes]

        J[page.tsx] -->|renderiza| A
    end

    subgraph "BFF - Next.js API Routes"
        K[/api/auth/login] -->|proxy| N
        L[/api/auth/me] -->|proxy| N
        M[/api/auth/logout] -->|clear token| N
        N[API Backend Service]
    end

    subgraph "Backend - NestJS"
        O[Auth Controller] -->|usa| P[Auth Service]
        P -->|bcrypt| Q[Password Hashing]
        P -->|genera| R[JWT Service]
        P -->|consulta| S[(Prisma DB)]

        T[JWT Strategy] -->|valida| R
        U[JWT Guard] -->|protege| O
        V[Roles Guard] -->|RBAC| O
    end

    F -->|HTTP| K
    F -->|HTTP| L
    N -->|HTTP| O

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style O fill:#ffe1e1
    style P fill:#ffe1e1
    style S fill:#f0f0f0
```

## 3. Flujo de Protección de Rutas

```mermaid
flowchart TD
    A[Usuario accede a ruta] --> B{Middleware verifica<br/>JWT en cookies}

    B -->|No hay token| C[Redirect a /login]
    B -->|Token existe| D{Es ruta admin?<br/>/users}

    D -->|No| E[Permitir acceso]
    D -->|Sí| F[Decodificar JWT]

    F --> G{Role === ADMIN?}
    G -->|No| H[Redirect a /dashboard<br/>Acceso denegado]
    G -->|Sí| E

    E --> I[Componente carga]
    I --> J[API Client agrega<br/>Authorization header]
    J --> K[Request a Backend]

    K --> L{Backend JWT<br/>Strategy valida}
    L -->|Inválido| M[Error 401]
    L -->|Válido| N{Roles Guard<br/>verifica permisos}

    N -->|Sin permisos| O[Error 403]
    N -->|Con permisos| P[Procesar request]

    M --> Q[Frontend muestra error]
    O --> Q
    P --> R[Retornar datos]

    style C fill:#ffcccc
    style H fill:#ffcccc
    style M fill:#ffcccc
    style O fill:#ffcccc
    style E fill:#ccffcc
    style P fill:#ccffcc
    style R fill:#ccffcc
```

## 4. Transformación de Datos (Login Response)

```mermaid
graph LR
    subgraph "Backend Response"
        A["{<br/>accessToken: 'jwt...',<br/>user: {<br/>  id: '123',<br/>  email: 'user@example.com',<br/>  name: 'Usuario',<br/>  role: 'ADMIN'<br/>}<br/>}"]
    end

    subgraph "BFF Transformation"
        B[Zod Validation] --> C[Role Mapping]
        C --> D["ADMIN → 'admin'<br/>SUPPORT → 'empleado'"]
    end

    subgraph "Frontend Storage"
        E["{<br/>accessToken: 'jwt...',<br/>user: {<br/>  id: '123',<br/>  email: 'user@example.com',<br/>  name: 'Usuario',<br/>  role: 'admin'<br/>}<br/>}"]

        F[localStorage:<br/>ltgt_access_token]
        G[Cookies:<br/>ltgt_access_token<br/>7 days]
        H[React Query Cache:<br/>current-user]
    end

    A --> B
    D --> E
    E --> F
    E --> G
    E --> H

    style A fill:#ffe1e1
    style E fill:#e1f5ff
    style F fill:#fff4e1
    style G fill:#fff4e1
    style H fill:#e1ffe1
```

## 5. Estados de Autenticación (React Query)

```mermaid
stateDiagram-v2
    [*] --> NoAutenticado: Inicio

    NoAutenticado --> Autenticando: login()

    Autenticando --> Autenticado: Success<br/>Token guardado
    Autenticando --> Error: Failure<br/>Credenciales inválidas

    Error --> NoAutenticado: Reintentar

    Autenticado --> CargandoUsuario: useCurrentUser<br/>fetch

    CargandoUsuario --> UsuarioCargado: Success<br/>Cache actualizado
    CargandoUsuario --> ErrorCarga: Failure<br/>Token inválido

    ErrorCarga --> NoAutenticado: Token expirado<br/>Logout automático

    UsuarioCargado --> UsuarioCargado: Refresh<br/>cada 10 min
    UsuarioCargado --> NoAutenticado: logout()

    Autenticado --> NoAutenticado: logout()<br/>Clear token
```

## 6. Estructura de JWT

```mermaid
graph TB
    subgraph "JWT Token Structure"
        A[Header] --> B["{<br/>alg: 'HS256',<br/>typ: 'JWT'<br/>}"]

        C[Payload] --> D["{<br/>sub: 'user-id-123',<br/>role: 'ADMIN',<br/>email: 'user@example.com',<br/>name: 'Usuario',<br/>iat: 1234567890,<br/>exp: 1234568790<br/>}"]

        E[Signature] --> F["HMACSHA256(<br/>base64(header) + '.' +<br/>base64(payload),<br/>JWT_ACCESS_SECRET<br/>)"]
    end

    subgraph "Token Lifecycle"
        G[Generado en Backend] -->|15 min expiry| H[Enviado al Frontend]
        H --> I[Guardado en localStorage<br/>y cookies]
        I --> J{Token válido?}
        J -->|Sí| K[Usado en requests]
        J -->|Expirado| L[Logout automático]
        K --> M[Backend valida<br/>con JWT Strategy]
    end

    D --> G

    style D fill:#e1f5ff
    style K fill:#ccffcc
    style L fill:#ffcccc
```

## 7. Validación de Schemas (Zod)

```mermaid
flowchart LR
    subgraph "Frontend - LoginForm"
        A[Usuario input] --> B[Zod Schema<br/>LoginRequestSchema]
        B --> C{Validación}
        C -->|Error| D[Mostrar errores]
        C -->|OK| E[Submit form]
    end

    subgraph "BFF - /api/auth/login"
        E --> F[Zod Schema<br/>Validación]
        F --> G{Validación}
        G -->|Error| H[Return 400]
        G -->|OK| I[Proxy to Backend]
    end

    subgraph "Backend - Auth Controller"
        I --> J[class-validator<br/>LoginDto]
        J --> K{Validación}
        K -->|Error| L[Return 400]
        K -->|OK| M[Auth Service]
    end

    M --> N[Database Query]

    style C fill:#fff4e1
    style G fill:#fff4e1
    style K fill:#fff4e1
    style D fill:#ffcccc
    style H fill:#ffcccc
    style L fill:#ffcccc
```

## 8. Gestión de Permisos (RBAC)

```mermaid
graph TB
    subgraph "Definición de Roles"
        A[Backend Roles] --> B["ADMIN<br/>SUPPORT"]
        C[Frontend Roles] --> D["admin<br/>empleado"]
    end

    subgraph "Middleware Protection"
        E[Public Routes] --> F[/, /login]
        G[Protected Routes] --> H[/dashboard<br/>/products<br/>/tickets<br/>/knowledge<br/>/communications]
        I[Admin Only Routes] --> J[/users]
    end

    subgraph "Backend Guards"
        K[@Roles Decorator] --> L[Roles Guard]
        L --> M{User role<br/>in required roles?}
        M -->|No| N[403 Forbidden]
        M -->|Yes| O[Allow access]
    end

    subgraph "Frontend Permissions"
        P[hasPermission] --> Q{Check role}
        Q -->|admin| R[Full access]
        Q -->|empleado| S[Limited access]
    end

    B --> D
    D --> Q
    J --> K

    style N fill:#ffcccc
    style O fill:#ccffcc
    style R fill:#ccffcc
```

## Resumen de Tecnologías

- **Frontend**: Next.js 14, React Query, Zod, TypeScript
- **BFF**: Next.js API Routes (Proxy pattern)
- **Backend**: NestJS, Passport JWT, bcrypt
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (15 min expiry)
- **Storage**: localStorage + cookies (7 days)
- **Validation**: Zod (frontend/BFF), class-validator (backend)
- **State Management**: React Query (no Redux)

## Características de Seguridad

1. ✅ Passwords hasheados con bcrypt
2. ✅ JWT con expiración (15 minutos)
3. ✅ Validación en múltiples capas (Frontend, BFF, Backend)
4. ✅ RBAC (Role-Based Access Control)
5. ✅ Middleware para protección de rutas
6. ✅ Guards de autenticación y autorización
7. ✅ Type safety con TypeScript + Zod
8. ✅ BFF pattern para separación de concerns
