'use client';

import { useSession } from '@/shared/session/session.client';

import { type Action, can, type Resource } from './permissions';

/** Permisos del usuario actual: `const can = useCan(); can('products', 'create')`. */
export function useCan(): (resource: Resource, action: Action) => boolean {
  const { user } = useSession();
  return (resource, action) => can(user?.role, resource, action);
}
