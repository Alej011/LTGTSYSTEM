import { describe, expect, it } from 'vitest';

import { can, canOpenPage } from './permissions';

describe('can', () => {
  it('grants nothing without a role', () => {
    expect(can(undefined, 'dashboard', 'view')).toBe(false);
  });

  it('denies actions the policy does not define for a resource', () => {
    expect(can('ADMIN', 'dashboard', 'delete')).toBe(false);
    expect(can('ADMIN', 'users', 'delete')).toBe(false);
    expect(can('ADMIN', 'tickets', 'edit')).toBe(false);
  });

  it.each([
    ['products', 'view', true, true],
    ['products', 'view_details', true, true],
    ['products', 'create', true, false],
    ['products', 'delete', true, false],
    ['users', 'view', true, false],
    ['users', 'edit', true, false],
    ['tickets', 'create', true, true],
    ['tickets', 'comment', true, true],
    ['tickets', 'handle', true, true],
    ['tickets', 'assign', true, false],
    ['tickets', 'close', true, false],
    ['tickets', 'delete', true, false],
    ['knowledge', 'view', true, true],
    ['knowledge', 'create', true, false],
    ['communications', 'edit', true, false],
  ] as const)('%s.%s: ADMIN %s, SUPPORT %s', (resource, action, admin, support) => {
    expect(can('ADMIN', resource, action)).toBe(admin);
    expect(can('SUPPORT', resource, action)).toBe(support);
  });
});

describe('canOpenPage', () => {
  it.each([
    ['/dashboard', 'SUPPORT', true],
    ['/products', 'SUPPORT', true],
    ['/users', 'SUPPORT', false],
    ['/users/u1', 'SUPPORT', false],
    ['/users', 'ADMIN', true],
    ['/usersettings', 'SUPPORT', true],
  ] as const)('%s for %s is %s', (pathname, role, allowed) => {
    expect(canOpenPage(role, pathname)).toBe(allowed);
  });

  it('blocks every section without a role', () => {
    expect(canOpenPage(undefined, '/dashboard')).toBe(false);
  });
});
