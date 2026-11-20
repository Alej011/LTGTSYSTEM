import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/shared/api/api-client';
import { bffCalls, mockBff } from '@/test/mock-bff';
import { renderHookWithQuery } from '@/test/render';

import { loginErrorMessage, useLogin, useLogout, useSession } from './session.client';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const admin = { id: 'u1', email: 'admin@ltgt.com', name: 'Admin', role: 'ADMIN' };

describe('useSession', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns the signed-in user', async () => {
    mockBff({ 'GET /api/auth/me': () => ({ status: 200, body: { ...admin, createdAt: '2026-11-08T00:00:00.000Z' } }) });

    const { result } = renderHookWithQuery(() => useSession());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.user).toMatchObject(admin);
    });
  });

  it('treats a 401 as no session rather than an error', async () => {
    mockBff({ 'GET /api/auth/me': () => ({ status: 401, body: { message: 'Sesión no iniciada o expirada' } }) });

    const { result } = renderHookWithQuery(() => useSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.user).toBeNull();
  });
});

describe('useLogin and useLogout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('makes the logged-in user the session user without asking the BFF again', async () => {
    const fetchMock = mockBff({
      'GET /api/auth/me': () => ({ status: 401, body: { message: 'Sin sesión' } }),
      'POST /api/auth/login': ({ body }) => ({
        status: 200,
        body: { user: { ...admin, email: (body as { email: string }).email } },
      }),
    });
    const { result } = renderHookWithQuery(() => ({ session: useSession(), login: useLogin() }));
    await waitFor(() => {
      expect(result.current.session.isLoading).toBe(false);
    });

    await act(() => result.current.login.mutateAsync({ email: 'admin@ltgt.com', password: 'secret123' }));

    await waitFor(() => {
      expect(result.current.session.user).toMatchObject(admin);
    });
    expect(bffCalls(fetchMock)).toEqual(['GET /api/auth/me', 'POST /api/auth/login']);
  });

  it('forgets the user and returns to the login even if the BFF fails', async () => {
    // El BFF borra las cookies aunque el backend no responda; después /auth/me ya no tiene sesión
    let signedIn = true;
    mockBff({
      'GET /api/auth/me': () =>
        signedIn ? { status: 200, body: admin } : { status: 401, body: { message: 'Sin sesión' } },
      'POST /api/auth/logout': () => {
        signedIn = false;
        return { status: 502, body: { message: 'Sin backend' } };
      },
    });
    const { result } = renderHookWithQuery(() => ({ session: useSession(), logout: useLogout() }));
    await waitFor(() => {
      expect(result.current.session.user).not.toBeNull();
    });

    act(() => {
      result.current.logout.mutate();
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/');
    });
    await waitFor(() => {
      expect(result.current.session.user).toBeNull();
    });
  });
});

describe('loginErrorMessage', () => {
  it.each([
    [401, 'Credenciales inválidas. Por favor intente nuevamente.'],
    [429, 'Demasiados intentos. Espera un minuto e intenta de nuevo.'],
    [502, 'Error del servidor. Por favor intenta nuevamente.'],
    [408, 'La petición tardó demasiado. Verifica tu conexión.'],
    [0, 'No se pudo conectar con el servidor. Verifica tu conexión.'],
  ])('explains HTTP %i with its own message', (status, message) => {
    expect(loginErrorMessage(new ApiClientError('x', status))).toBe(message);
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(loginErrorMessage(new Error('boom'))).toBe('Error inesperado. Por favor intente nuevamente.');
  });
});
