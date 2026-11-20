import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';

import { useCan } from './use-can';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));

function canFor(user: ReturnType<typeof useAuth>['user']) {
  vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>);
  return renderHook(() => useCan()).result.current;
}

describe('useCan', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('applies the policy to the role of the signed-in user', () => {
    const can = canFor({ id: 'u2', email: 'soporte@ltgt.com', name: 'Soporte', role: 'SUPPORT' });

    expect(can('products', 'view')).toBe(true);
    expect(can('products', 'create')).toBe(false);
    expect(can('users', 'view')).toBe(false);
  });

  it('grants nothing without a session', () => {
    expect(canFor(null)('dashboard', 'view')).toBe(false);
  });
});
