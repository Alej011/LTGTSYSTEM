/**
 * Política de permisos: única fuente de qué puede hacer cada rol sobre cada recurso.
 * La usan los componentes (con useCan), proxy.ts y los layouts del servidor.
 * Es una protección de interfaz: la autorización real la hace el backend con @Roles, y
 * backend/src/permissions.spec.ts falla si esta tabla y los @Roles dejan de coincidir.
 * Sin dependencias fuera de esta carpeta, para que ese test pueda importarla.
 */
import type { Role } from './roles';

export const ACTIONS = [
  'view',
  'view_details',
  'create',
  'edit',
  'delete',
  'comment',
  'handle',
  'assign',
  'close',
] as const;
export type Action = (typeof ACTIONS)[number];
export type Resource = 'dashboard' | 'products' | 'users' | 'tickets' | 'knowledge' | 'communications';

const ALL: readonly Role[] = ['ADMIN', 'SUPPORT'];
const ADMIN: readonly Role[] = ['ADMIN'];

// Una acción ausente no la puede hacer nadie
const POLICY: Record<Resource, Partial<Record<Action, readonly Role[]>>> = {
  dashboard: { view: ALL },
  products: { view: ALL, view_details: ALL, create: ADMIN, edit: ADMIN, delete: ADMIN },
  users: { view: ADMIN, view_details: ADMIN, create: ADMIN, edit: ADMIN },
  // handle: atender (tomar, resolver, notas internas); solo quien lo tiene puede ser asignado. close: cerrar sin confirmación
  tickets: {
    view: ALL,
    view_details: ALL,
    create: ALL,
    comment: ALL,
    handle: ALL,
    assign: ADMIN,
    close: ADMIN,
    delete: ADMIN,
  },
  knowledge: { view: ALL, view_details: ALL, create: ADMIN, edit: ADMIN, delete: ADMIN },
  communications: { view: ALL, view_details: ALL, create: ADMIN, edit: ADMIN, delete: ADMIN },
};

/** Sin rol (sin sesión) no hay ningún permiso. */
export function can(role: Role | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false;
  return POLICY[resource][action]?.includes(role) ?? false;
}

// Cada sección de la app corresponde a un recurso
const PAGE_RESOURCES: Record<string, Resource> = {
  '/dashboard': 'dashboard',
  '/products': 'products',
  '/users': 'users',
  '/tickets': 'tickets',
  '/knowledge': 'knowledge',
  '/communications': 'communications',
};

/** Si el rol puede abrir la página (o una subruta de ella). Las páginas sin recurso son libres. */
export function canOpenPage(role: Role | undefined, pathname: string): boolean {
  const page = Object.keys(PAGE_RESOURCES).find((path) => pathname === path || pathname.startsWith(`${path}/`));
  return page === undefined || can(role, PAGE_RESOURCES[page], 'view');
}
