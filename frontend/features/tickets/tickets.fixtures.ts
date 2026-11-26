import type { Viewer } from './tickets.rules';
import type { Ticket } from './tickets.schemas';

// Usuarios de prueba: el solicitante es un agente de soporte que abre un ticket propio
export const admin: Viewer = { id: 'u-admin', name: 'Laura Admin', role: 'ADMIN' };
export const agent: Viewer = { id: 'u-agent', name: 'Luis Soporte', role: 'SUPPORT' };
export const requester: Viewer = { id: 'u-requester', name: 'Ana Solicitante', role: 'SUPPORT' };

export function ticket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 't1',
    title: 'Sin conexión a la red',
    description: 'El equipo no tiene internet',
    category: 'NETWORK',
    priority: 'HIGH',
    status: 'OPEN',
    requester: { id: requester.id, name: requester.name },
    assignee: null,
    solution: null,
    closeReason: null,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
    resolvedAt: null,
    closedAt: null,
    ...overrides,
  };
}

export const assignedTo = (viewer: Viewer) => ({ id: viewer.id, name: viewer.name });
