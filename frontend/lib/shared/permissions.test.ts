import { describe, expect, it } from 'vitest';

import { getResourcePermissions, hasPermission } from './permissions';

describe('hasPermission', () => {
  it('denies every action when there is no role', () => {
    expect(hasPermission(undefined, 'products', 'view')).toBe(false);
  });

  it('denies actions the matrix does not define for a resource', () => {
    expect(hasPermission('admin', 'dashboard', 'delete')).toBe(false);
  });

  it.each([
    ['products', 'view', true],
    ['products', 'create', false],
    ['users', 'view', false],
    ['tickets', 'edit', true],
    ['tickets', 'delete', false],
    ['knowledge', 'create', false],
  ] as const)('empleado on %s.%s is %s', (resource, action, allowed) => {
    expect(hasPermission('empleado', resource, action)).toBe(allowed);
  });
});

describe('getResourcePermissions', () => {
  it('grants admin full access to users', () => {
    expect(getResourcePermissions('admin', 'users')).toEqual({
      canView: true,
      canViewDetails: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    });
  });

  it('returns no permissions without a role', () => {
    expect(Object.values(getResourcePermissions(undefined, 'tickets')).some(Boolean)).toBe(false);
  });
});
