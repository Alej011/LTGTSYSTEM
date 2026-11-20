import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/shared/api/api-client';
import { bffCalls, mockBff } from '@/test/mock-bff';
import { renderHookWithQuery } from '@/test/render';

import { useSaveUser, useUsers } from './users.client';
import { admin, support } from './users.fixtures';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useUsers', () => {
  it('lists the users', async () => {
    mockBff({ 'GET /api/users': () => ({ status: 200, body: [admin, support] }) });

    const { result } = renderHookWithQuery(() => useUsers());

    await waitFor(() => {
      expect(result.current.data).toEqual([admin, support]);
    });
  });

  it('exposes failures as ApiClientError instead of an empty list', async () => {
    mockBff({ 'GET /api/users': () => ({ status: 403, body: { message: 'Forbidden' } }) });

    const { result } = renderHookWithQuery(() => useUsers());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(ApiClientError);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useSaveUser', () => {
  it('creates with POST and updates with PATCH, refreshing the list each time', async () => {
    const sent: unknown[] = [];
    const fetchMock = mockBff({
      'GET /api/users': () => ({ status: 200, body: [admin] }),
      'POST /api/users': ({ body }) => {
        sent.push(body);
        return { status: 201, body: support };
      },
      'PATCH /api/users/:id': ({ body }) => {
        sent.push(body);
        return { status: 200, body: support };
      },
    });
    const { result } = renderHookWithQuery(() => ({ list: useUsers(), save: useSaveUser() }));
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });

    const input = { email: support.email, name: support.name, password: 'secret123', role: 'SUPPORT' as const };
    await act(() => result.current.save.mutateAsync({ input }));
    await act(() => result.current.save.mutateAsync({ id: 'u2', changes: { name: 'Soporte 2', role: 'ADMIN' } }));

    expect(bffCalls(fetchMock)).toEqual([
      'GET /api/users',
      'POST /api/users',
      'GET /api/users',
      'PATCH /api/users/u2',
      'GET /api/users',
    ]);
    expect(sent).toEqual([input, { name: 'Soporte 2', role: 'ADMIN' }]);
  });

  it('rejects with the backend message, e.g. a duplicated email', async () => {
    mockBff({ 'POST /api/users': () => ({ status: 409, body: { message: 'El email ya está registrado' } }) });
    const { result } = renderHookWithQuery(() => useSaveUser());

    await expect(
      act(() =>
        result.current.mutateAsync({
          input: { email: 'x@ltgt.com', name: 'Equis', password: 'secret123', role: 'SUPPORT' },
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 409, message: 'El email ya está registrado' });
  });
});
