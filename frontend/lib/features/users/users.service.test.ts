import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createUser, getUsers, updateUser } from './users.service';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const user = { id: 'u1', email: 'soporte@ltgt.com', name: 'Soporte', role: 'empleado' };

describe('users service REST paths', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('lists users from the collection', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [user]));

    await getUsers();

    expect(fetchMock).toHaveBeenCalledWith('/api/users', expect.objectContaining({ method: 'GET' }));
  });

  it('creates a user by posting to the collection', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, user));

    await createUser({ email: user.email, name: user.name, password: 'secret123', role: 'SUPPORT' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users', expect.objectContaining({ method: 'POST' }));
  });

  it('updates a user through its resource path', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, user));

    await updateUser('u1', { name: 'Soporte 2' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/u1', expect.objectContaining({ method: 'PATCH' }));
  });
});
