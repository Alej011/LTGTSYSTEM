'use client';

import { useAuth } from '@/contexts/auth-context';

import { type Action, can, type Resource } from './permissions';

/** Permisos del usuario actual: `const can = useCan(); can('products', 'create')`. */
export function useCan(): (resource: Resource, action: Action) => boolean {
  const { user } = useAuth();
  return (resource, action) => can(user?.role, resource, action);
}
