/**
 * Cliente HTTP centralizado con interceptors
 * Maneja automáticamente:
 * - Headers de autorización (JWT)
 * - Timeouts
 * - Manejo de errores
 * - Logs en desarrollo
 */

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
 * Clase para errores de API
 */
export class ApiClientError extends Error {
  statusCode: number
  error?: string

  constructor(message: string, statusCode: number, error?: string) {
    super(message)
    this.name = "ApiClientError"
    this.statusCode = statusCode
    this.error = error
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
 * Guarda el token JWT en localStorage
 */
export function saveToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
}

/**
 * Elimina el token JWT del localStorage
 */
export function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Configuración base para las peticiones
 */
interface RequestConfig extends RequestInit {
  timeout?: number
  requiresAuth?: boolean
}

/**
 * Realiza una petición HTTP con configuración centralizada
 */
async function request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const {
    timeout = API_TIMEOUT,
    requiresAuth = true,
    headers: customHeaders = {},
    ...restConfig
  } = config

  // Construir URL completa
  const url = `${API_BASE_URL}${endpoint}`

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

    // Log en desarrollo
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
   */
  get: <T = any>(endpoint: string, config?: RequestConfig) => {
    return request<T>(endpoint, { ...config, method: "GET" })
  },

  /**
   * POST request
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
   */
  delete: <T = any>(endpoint: string, config?: RequestConfig) => {
    return request<T>(endpoint, { ...config, method: "DELETE" })
  },
}
