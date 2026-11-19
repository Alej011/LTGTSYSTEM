import { describe, expect, it } from 'vitest';

import { mapBackendRoleToFrontend, mapFrontendRoleToBackend } from '@/lib/schemas/auth.schema';

import { CreateUserRequestSchema, UpdateUserRequestSchema } from './users.schemas';

const newUser = { email: 'soporte@ltgt.com', name: 'Soporte', password: 'secret123' };

describe('user role validation in the BFF', () => {
  it.each(['ADMIN', 'SUPPORT'])('accepts the backend role %s', (role) => {
    expect(CreateUserRequestSchema.safeParse({ ...newUser, role }).success).toBe(true);
  });

  it.each(['admin', 'support', 'Admin', 'empleado'])('rejects %s, which the backend would answer with 400', (role) => {
    expect(CreateUserRequestSchema.safeParse({ ...newUser, role }).success).toBe(false);
    expect(UpdateUserRequestSchema.safeParse({ role }).success).toBe(false);
  });
});

describe('role translation', () => {
  it.each([
    ['ADMIN', 'admin'],
    ['SUPPORT', 'empleado'],
  ] as const)('%s and %s map to each other', (backend, frontend) => {
    expect(mapBackendRoleToFrontend(backend)).toBe(frontend);
    expect(mapFrontendRoleToBackend(frontend)).toBe(backend);
  });
});
