import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/lib/shared/api-client';

import { authenticate, getLoginErrorMessage } from './auth.service';

describe('authenticate', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('rejects with the status of the failed login instead of returning null', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'ThrottlerException: Too Many Requests' }), {
        status: 429,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(authenticate('admin@ltgt.com', 'secret')).rejects.toMatchObject({ statusCode: 429 });
  });
});

describe('getLoginErrorMessage', () => {
  it.each([
    [401, 'Credenciales inválidas. Por favor intente nuevamente.'],
    [429, 'Demasiados intentos. Espera un minuto e intenta de nuevo.'],
    [502, 'Error del servidor. Por favor intenta nuevamente.'],
    [408, 'La petición tardó demasiado. Verifica tu conexión.'],
    [0, 'No se pudo conectar con el servidor. Verifica tu conexión.'],
  ])('maps HTTP %i to its own message', (status, message) => {
    expect(getLoginErrorMessage(new ApiClientError('x', status))).toBe(message);
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(getLoginErrorMessage(new Error('boom'))).toBe('Error inesperado. Por favor intente nuevamente.');
  });
});
