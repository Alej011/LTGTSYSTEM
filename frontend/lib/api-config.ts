/**
 * Configuración centralizada de la API
 * Todas las URLs y endpoints se manejan desde aquí
 */

// URL base de la API desde variables de entorno
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

// Endpoints de la API organizados por módulo
// IMPORTANTE: Todas las rutas ahora tienen el prefijo /api desde el backend
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
  },
  users: {
    list: "/api/users",
    detail: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
  },
  // Endpoints futuros (cuando conectes los otros módulos)
  tickets: {
    list: "/api/tickets",
    detail: (id: string) => `/api/tickets/${id}`,
    create: "/api/tickets",
    update: (id: string) => `/api/tickets/${id}`,
  },
  products: {
    list: "/api/products/list",
    detail: (id: string) => `/api/products/${id}`,
    create: "/api/products/create",
    update: (id: string) => `/api/products/update/${id}`,
    delete: (id: string) => `/api/products/delete/${id}`,
  },
  brands: {
    list: "/api/brands",
    detail: (id: string) => `/api/brands/${id}`,
  },
  categories: {
    list: "/api/categories",
    detail: (id: string) => `/api/categories/${id}`,
  },
  knowledge: {
    list: "/api/knowledge",
    detail: (id: string) => `/api/knowledge/${id}`,
    create: "/api/knowledge",
    update: (id: string) => `/api/knowledge/${id}`,
  },
} as const

// Timeout por defecto para las peticiones
export const API_TIMEOUT = 10000 // 10 segundos

// Keys para localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "ltgt_access_token",
  USER_DATA: "ltgt_user",
} as const
