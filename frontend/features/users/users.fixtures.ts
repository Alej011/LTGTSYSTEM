import type { User } from './users.client';

// Datos de prueba con la forma que devuelve el BFF (rol en el vocabulario del frontend)
export const admin: User = { id: 'u1', email: 'admin@ltgt.com', name: 'Admin', role: 'admin' };
export const support: User = { id: 'u2', email: 'soporte@ltgt.com', name: 'Soporte', role: 'empleado' };
