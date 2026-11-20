'use client';

import { useAuth } from '@/contexts/auth-context';
import { mapFrontendRoleToBackend } from '@/lib/schemas/auth.schema';

import { type Action, can, type Resource } from './permissions';

/** Permisos del usuario actual: `const can = useCan(); can('products', 'create')`. */
export function useCan(): (resource: Resource, action: Action) => boolean {
  const { user } = useAuth();
  const role = user ? mapFrontendRoleToBackend(user.role) : undefined;
  return (resource, action) => can(role, resource, action);
}
