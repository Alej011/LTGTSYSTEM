/**
 * Cliente HTTP centralizado para llamar al BFF.
 * La sesión viaja en cookies HttpOnly que el navegador envía solo; aquí no se maneja ningún token.
 * Maneja automáticamente:
 * - Timeouts
 * - Manejo de errores
 * - Logs en desarrollo
 * - Validación de respuestas con Zod (opcional)
 */

import { z } from 'zod';

import { API_TIMEOUT } from './api-config';

/**
 * Clase para errores de API mejorada
 */
// diccionary of error messages for different status codes
const ERROR_MESSAGES: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión.',
  401: 'Sesión expirada. Por favor inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  408: 'La petición tardó demasiado. Verifica tu conexión.',
  429: 'Demasiados intentos. Espera un minuto e intenta de nuevo.',
};
export class ApiClientError extends Error {
  statusCode: number;
  error?: string;
  code?: string;
  field?: string; // For validation errors

  constructor(message: string, statusCode: number, error?: string, code?: string, field?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.error = error;
    this.code = code;
    this.field = field;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if(this.isValidationError()){
      return  `Error de validacion: ${this.message}`;
    }

    if (this.isServerError()){
      return 'Error del servidor. Por favor intenta nuevamente.';
    }
    
    return ERROR_MESSAGES[this.statusCode] || this.message || 'Error desconocido';
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 422 || this.statusCode === 400;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// Una 401 fuera de /api/auth significa que la sesión terminó y no se pudo renovar
function handleExpiredSession(endpoint: string): void {
  if (typeof window === 'undefined' || endpoint.startsWith('/api/auth/')) return;
  const redirect = encodeURIComponent(window.location.pathname);
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload clears client state
  window.location.assign(`/?redirect=${redirect}`);
}

// El cuerpo de error puede traer message como texto o como lista (validación de Nest)
function errorField(data: unknown, key: 'message' | 'error'): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined;
  const value = (data as Record<string, unknown>)[key];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  return undefined;
}

/**
 * Configuración base para las peticiones
 */
interface RequestConfig extends RequestInit {
  timeout?: number;
  schema?: z.ZodType; // Optional Zod schema for response validation
}

/**
 * Realiza una petición HTTP con configuración centralizada
 */
async function request<T = unknown>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { timeout = API_TIMEOUT, headers: customHeaders = {}, schema, ...restConfig } = config;

  // El navegador solo habla con el BFF (rutas /api de Next.js), nunca con el backend directo
  const url = endpoint;

  // Headers por defecto
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Controller para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${restConfig.method || 'GET'} ${url}`);
    }

    // Realizar petición
    const response = await fetch(url, {
      ...restConfig,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parsear respuesta
    let data: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Manejar errores HTTP
    if (!response.ok) {
      if (response.status === 401) handleExpiredSession(endpoint);
      const errorMessage = errorField(data, 'message') || errorField(data, 'error') || 'Error en la petición';
      throw new ApiClientError(errorMessage, response.status, errorField(data, 'error'));
    }

    // Validar respuesta con Zod si se proporciona schema
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error('[API] Schema validation failed:', result.error);
        console.error('[API] Received data:', data);
        throw new ApiClientError(
          'La respuesta del servidor no tiene el formato esperado',
          500,
          'SCHEMA_VALIDATION_ERROR',
        );
      }

      // Log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Response validated:`, result.data);
      }

      return result.data as T;
    }

    // Log en desarrollo (sin validación)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Response:`, data);
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Error de timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError('Timeout: La petición tardó demasiado', 408);
    }

    // Error de red
    if (error instanceof TypeError) {
      throw new ApiClientError('Error de red: No se pudo conectar con el servidor', 0);
    }

    // Re-throw si ya es ApiClientError
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Error desconocido
    throw new ApiClientError((error instanceof Error && error.message) || 'Error desconocido', 500);
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
  get: <T = unknown>(endpoint: string, config?: RequestConfig) => {
    return request<T>(endpoint, { ...config, method: 'GET' });
  },

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param config - Request configuration including optional Zod schema
   * @example
   * const user = await apiClient.post('/api/users', userData, { schema: UserSchema })
   */
  post: <T = unknown>(endpoint: string, data?: unknown, config?: RequestConfig) => {
    return request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param config - Request configuration including optional Zod schema
   */
  put: <T = unknown>(endpoint: string, data?: unknown, config?: RequestConfig) => {
    return request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body (partial update)
   * @param config - Request configuration including optional Zod schema
   */
  patch: <T = unknown>(endpoint: string, data?: unknown, config?: RequestConfig) => {
    return request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param config - Request configuration including optional Zod schema
   */
  delete: <T = unknown>(endpoint: string, config?: RequestConfig) => {
    return request<T>(endpoint, { ...config, method: 'DELETE' });
  },
};
