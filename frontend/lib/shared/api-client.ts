/**
 * Cliente HTTP centralizado con interceptors
 * Maneja automáticamente:
 * - Headers de autorización (JWT)
 * - Timeouts
 * - Manejo de errores
 * - Logs en desarrollo
 * - Validación de respuestas con Zod (opcional)
 */

import { z } from "zod"
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from "./api-config"

// Tipos de respuesta de la API
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

/**
 * Clase para errores de API mejorada
 */
export class ApiClientError extends Error {
  statusCode: number
  error?: string
  code?: string
  field?: string // For validation errors

  constructor(
    message: string,
    statusCode: number,
    error?: string,
    code?: string,
    field?: string
  ) {
    super(message)
    this.name = "ApiClientError"
    this.statusCode = statusCode
    this.error = error
    this.code = code
    this.field = field
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.statusCode === 401) {
      return "Sesión expirada. Por favor inicia sesión nuevamente."
    }
    if (this.statusCode === 403) {
      return "No tienes permisos para realizar esta acción."
    }
    if (this.statusCode === 404) {
      return "El recurso solicitado no existe."
    }
    if (this.statusCode === 422 || this.statusCode === 400) {
      return `Error de validación: ${this.message}`
    }
    if (this.statusCode >= 500) {
      return "Error del servidor. Por favor intenta nuevamente."
    }
    if (this.statusCode === 408) {
      return "La petición tardó demasiado. Verifica tu conexión."
    }
    if (this.statusCode === 0) {
      return "No se pudo conectar con el servidor. Verifica tu conexión."
    }
    return this.message || "Ocurrió un error inesperado."
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 422 || this.statusCode === 400
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.statusCode >= 500
  }
}

/**
 * Obtiene el token JWT del localStorage
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Guarda el token JWT en localStorage y cookies
 * Cookies are needed for middleware access
 */
export function saveToken(token: string): void {
  if (typeof window === "undefined") return

  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)

  // Save to cookie (7 days expiration)
  const expirationDays = 7
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + expirationDays)

  document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`
}

/**
 * Elimina el token JWT del localStorage y cookies
 */
export function removeToken(): void {
  if (typeof window === "undefined") return

  // Remove from localStorage
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)

  // Remove from cookies
  document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

/**
 * Configuración base para las peticiones
 */
interface RequestConfig extends RequestInit {
  timeout?: number
  requiresAuth?: boolean
  schema?: z.ZodType<any> // Optional Zod schema for response validation
}

/**
 * Realiza una petición HTTP con configuración centralizada
 */
async function request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const {
    timeout = API_TIMEOUT,
    requiresAuth = true,
    headers: customHeaders = {},
    schema,
    ...restConfig
  } = config

  // Construir URL completa
  // Si el endpoint empieza con /api/, es un endpoint del BFF (Next.js API Routes)
  // Si no, es un endpoint del backend directo
  const url = endpoint.startsWith("/api/") ? endpoint : `${API_BASE_URL}${endpoint}`

  // Headers por defecto
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  }

  // Agregar token si es necesario
  if (requiresAuth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  // Controller para timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Log en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${restConfig.method || "GET"} ${url}`)
    }

    // Realizar petición
    const response = await fetch(url, {
      ...restConfig,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Parsear respuesta
    let data: any
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Manejar errores HTTP
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || "Error en la petición"
      throw new ApiClientError(errorMessage, response.status, data?.error)
    }

    // Validar respuesta con Zod si se proporciona schema
    if (schema) {
      const result = schema.safeParse(data)
      if (!result.success) {
        console.error("[API] Schema validation failed:", result.error)
        console.error("[API] Received data:", data)
        throw new ApiClientError(
          "La respuesta del servidor no tiene el formato esperado",
          500,
          "SCHEMA_VALIDATION_ERROR"
        )
      }

      // Log en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.log(`[API] Response validated:`, result.data)
      }

      return result.data as T
    }

    // Log en desarrollo (sin validación)
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Response:`, data)
    }

    return data as T
  } catch (error: any) {
    clearTimeout(timeoutId)

    // Error de timeout
    if (error.name === "AbortError") {
      throw new ApiClientError("Timeout: La petición tardó demasiado", 408)
    }

    // Error de red
    if (error instanceof TypeError) {
      throw new ApiClientError("Error de red: No se pudo conectar con el servidor", 0)
    }

    // Re-throw si ya es ApiClientError
    if (error instanceof ApiClientError) {
      throw error
    }

    // Error desconocido
    throw new ApiClientError(error.message || "Error desconocido", 500)
  }
}

/**
 * Cliente API con métodos HTTP
 */
export const apiClient = {
  /**
   * GET request
   * @param endpoint - API endpoint (e.g., '/api/users')
   * @param config - Request configuration including optional Zod schema
   * @example
   * const users = await apiClient.get('/api/users', { schema: UsersSchema })
   */
  get: <T = any>(endpoint: string, config?: RequestConfig) => {
    return request<T>(endpoint, { ...config, method: "GET" })
  },

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param config - Request configuration including optional Zod schema
   * @example
   * const user = await apiClient.post('/api/users', userData, { schema: UserSchema })
   */
  post: <T = any>(endpoint: string, data?: any, config?: RequestConfig) => {
    return request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param config - Request configuration including optional Zod schema
   */
  put: <T = any>(endpoint: string, data?: any, config?: RequestConfig) => {
    return request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body (partial update)
   * @param config - Request configuration including optional Zod schema
   */
  patch: <T = any>(endpoint: string, data?: any, config?: RequestConfig) => {
    return request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param config - Request configuration including optional Zod schema
   */
  delete: <T = any>(endpoint: string, config?: RequestConfig) => {
    return request<T>(endpoint, { ...config, method: "DELETE" })
  },
}
