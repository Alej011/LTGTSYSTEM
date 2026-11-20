// Roles del backend (enum Role de Prisma). Sin dependencias: el test de permisos del backend importa este archivo.
export const ROLES = ['ADMIN', 'SUPPORT'] as const;
export type Role = (typeof ROLES)[number];
