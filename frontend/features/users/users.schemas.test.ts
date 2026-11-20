import { describe, expect, it } from 'vitest';

import { mapBackendRoleToFrontend, mapFrontendRoleToBackend } from '@/lib/schemas/auth.schema';

describe('role translation', () => {
  it.each([
    ['ADMIN', 'admin'],
    ['SUPPORT', 'empleado'],
  ] as const)('%s and %s map to each other', (backend, frontend) => {
    expect(mapBackendRoleToFrontend(backend)).toBe(frontend);
    expect(mapFrontendRoleToBackend(frontend)).toBe(backend);
  });
});
