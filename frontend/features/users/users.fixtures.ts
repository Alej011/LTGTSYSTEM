import type { User } from './users.client';

// Datos de prueba con la forma que devuelve el BFF, que es la del backend
export const admin: User = { id: 'u1', email: 'admin@ltgt.com', name: 'Admin', role: 'ADMIN' };
export const support: User = { id: 'u2', email: 'soporte@ltgt.com', name: 'Soporte', role: 'SUPPORT' };
