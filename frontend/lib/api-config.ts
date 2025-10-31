/**
 * Configuración centralizada de la API
 * Todas las URLs y endpoints se manejan desde aquí
 */

// URL base de la API desde variables de entorno
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

// Endpoints de la API organizados por módulo
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
  },
  // Endpoints futuros (cuando conectes los otros módulos)
  tickets: {
    list: "/tickets",
    detail: (id: string) => `/tickets/${id}`,
    create: "/tickets",
    update: (id: string) => `/tickets/${id}`,
  },
  products: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
    create: "/products",
    update: (id: string) => `/products/${id}`,
  },
  knowledge: {
    list: "/knowledge",
    detail: (id: string) => `/knowledge/${id}`,
    create: "/knowledge",
    update: (id: string) => `/knowledge/${id}`,
  },
} as const

// Timeout por defecto para las peticiones
export const API_TIMEOUT = 10000 // 10 segundos

// Keys para localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "ltgt_access_token",
  USER_DATA: "ltgt_user",
} as const
