// Roles del backend (enum Role de Prisma). Sin dependencias: el test de permisos del backend importa este archivo.
export const ROLES = ['ADMIN', 'SUPPORT'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = { ADMIN: 'Administrador', SUPPORT: 'Soporte' };

// Los datos mock guardan el rol como texto libre; un valor desconocido se muestra tal cual
export function roleLabel(role: string): string {
  return (ROLE_LABELS as Record<string, string | undefined>)[role] ?? role;
}
