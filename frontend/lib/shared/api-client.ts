/**
 * Cliente HTTP del navegador. Solo habla con el BFF (rutas /api de Next.js), nunca con el backend directo.
 * La sesión viaja en cookies HttpOnly que el navegador envía solo; aquí no se maneja ningún token.
 * Toda falla (HTTP, red o timeout) llega como ApiClientError.
 */

import { API_TIMEOUT } from './api-config';

const ERROR_MESSAGES: Partial<Record<number, string>> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión.',
  401: 'Sesión expirada. Por favor inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  408: 'La petición tardó demasiado. Verifica tu conexión.',
  429: 'Demasiados intentos. Espera un minuto e intenta de nuevo.',
};

/** statusCode es el HTTP de la respuesta; 0 indica falla de red y 408 timeout. */
export class ApiClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }

  /** Mensaje para mostrar al usuario */
  getUserMessage(): string {
    if (this.isValidationError()) {
      return `Error de validación: ${this.message}`;
    }

    if (this.isServerError()) {
      return 'Error del servidor. Por favor intenta nuevamente.';
    }

    return ERROR_MESSAGES[this.statusCode] ?? (this.message || 'Ocurrió un error inesperado.');
  }

  isValidationError(): boolean {
    return this.statusCode === 422 || this.statusCode === 400;
  }

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

async function request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(endpoint, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data: unknown = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) handleExpiredSession(endpoint);
      const message = errorField(data, 'message') || errorField(data, 'error') || 'Error en la petición';
      throw new ApiClientError(message, response.status);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (controller.signal.aborted) {
      throw new ApiClientError('Timeout: La petición tardó demasiado', 408);
    }
    if (error instanceof TypeError) {
      throw new ApiClientError('Error de red: No se pudo conectar con el servidor', 0);
    }
    throw new ApiClientError((error instanceof Error && error.message) || 'Error desconocido', 500);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T = unknown>(endpoint: string) => request<T>('GET', endpoint),
  post: <T = unknown>(endpoint: string, body?: unknown) => request<T>('POST', endpoint, body),
  patch: <T = unknown>(endpoint: string, body?: unknown) => request<T>('PATCH', endpoint, body),
  delete: <T = unknown>(endpoint: string) => request<T>('DELETE', endpoint),
};
