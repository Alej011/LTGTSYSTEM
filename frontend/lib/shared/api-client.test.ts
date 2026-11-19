import { afterEach, describe, expect, it, vi } from 'vitest';

import { bffCalls, mockBff } from '@/test/mock-bff';

import { apiClient, ApiClientError } from './api-client';
import { API_TIMEOUT } from './api-config';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ApiClientError.getUserMessage', () => {
  it.each([
    [0, 'No se pudo conectar con el servidor. Verifica tu conexión.'],
    [401, 'Sesión expirada. Por favor inicia sesión nuevamente.'],
    [403, 'No tienes permisos para realizar esta acción.'],
    [404, 'El recurso solicitado no existe.'],
    [408, 'La petición tardó demasiado. Verifica tu conexión.'],
    [429, 'Demasiados intentos. Espera un minuto e intenta de nuevo.'],
    [500, 'Error del servidor. Por favor intenta nuevamente.'],
    [503, 'Error del servidor. Por favor intenta nuevamente.'],
  ])('maps HTTP %i to a fixed message', (status, message) => {
    expect(new ApiClientError('detalle del backend', status).getUserMessage()).toBe(message);
  });

  it.each([400, 422])('shows the backend detail for validation errors (HTTP %i)', (status) => {
    expect(new ApiClientError('name must be a string', status).getUserMessage()).toBe(
      'Error de validación: name must be a string',
    );
  });

  it('falls back to the backend message for other status codes', () => {
    expect(new ApiClientError('El SKU ya existe', 409).getUserMessage()).toBe('El SKU ya existe');
  });

  it('falls back to a generic message when there is no detail', () => {
    expect(new ApiClientError('', 409).getUserMessage()).toBe('Ocurrió un error inesperado.');
  });
});

describe('apiClient', () => {
  it('sends the method and a JSON body, and returns the parsed response', async () => {
    const fetchMock = mockBff({
      'POST /api/products': ({ body }) => ({ status: 201, body: { id: 'p1', ...(body as object) } }),
    });

    const created = await apiClient.post('/api/products', { name: 'Router' });

    expect(created).toEqual({ id: 'p1', name: 'Router' });
    expect(bffCalls(fetchMock)).toEqual(['POST /api/products']);
    const init = fetchMock.mock.calls[0][1];
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json');
  });

  it.each([false, 0, ''])('sends the falsy JSON body %j instead of dropping it', async (value) => {
    const fetchMock = mockBff({ 'PATCH /api/settings': () => ({ status: 200, body: {} }) });

    await apiClient.patch('/api/settings', value);

    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify(value));
  });

  it('sends GET without a body', async () => {
    const fetchMock = mockBff({ 'GET /api/users': () => ({ status: 200, body: [] }) });

    await apiClient.get('/api/users');

    expect(fetchMock.mock.calls[0][1]?.body).toBeUndefined();
  });

  it('throws ApiClientError with the status and the backend message', async () => {
    mockBff({ 'PATCH /api/users/:id': () => ({ status: 409, body: { message: 'El email ya existe' } }) });

    await expect(apiClient.patch('/api/users/u1', { name: 'x' })).rejects.toMatchObject({
      name: 'ApiClientError',
      statusCode: 409,
      message: 'El email ya existe',
    });
  });

  it('joins the validation messages that Nest sends as a list', async () => {
    mockBff({
      'POST /api/users': () => ({ status: 400, body: { message: ['email must be an email', 'name is empty'] } }),
    });

    await expect(apiClient.post('/api/users', {})).rejects.toMatchObject({
      statusCode: 400,
      message: 'email must be an email, name is empty',
    });
  });

  it('uses the error field when the body has no message', async () => {
    mockBff({ 'DELETE /api/products/:id': () => ({ status: 404, body: { error: 'Not Found' } }) });

    await expect(apiClient.delete('/api/products/p1')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Not Found',
    });
  });

  it('turns a network failure into status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiClient.get('/api/users')).rejects.toMatchObject({ statusCode: 0 });
  });

  it('aborts after the timeout with status 408', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
            );
          }),
      ),
    );

    const pending = expect(apiClient.get('/api/users')).rejects.toMatchObject({ statusCode: 408 });
    await vi.advanceTimersByTimeAsync(API_TIMEOUT);
    await pending;
  });

  describe('expired session', () => {
    function stubLocation() {
      const assign = vi.fn();
      vi.stubGlobal('location', { pathname: '/products', assign });
      return assign;
    }

    it('sends the user to login and keeps the page to come back to', async () => {
      const assign = stubLocation();
      mockBff({ 'GET /api/products': () => ({ status: 401, body: { message: 'Unauthorized' } }) });

      await expect(apiClient.get('/api/products')).rejects.toMatchObject({ statusCode: 401 });

      expect(assign).toHaveBeenCalledWith('/?redirect=%2Fproducts');
    });

    it('does not redirect on a 401 from the auth routes', async () => {
      const assign = stubLocation();
      mockBff({ 'POST /api/auth/login': () => ({ status: 401, body: { message: 'Unauthorized' } }) });

      await expect(apiClient.post('/api/auth/login', {})).rejects.toMatchObject({ statusCode: 401 });

      expect(assign).not.toHaveBeenCalled();
    });
  });
});
