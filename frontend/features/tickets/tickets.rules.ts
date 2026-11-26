/**
 * Reglas de transición de un ticket (docs/roles-y-permisos.md, HU-T03 a HU-T08).
 * Funciones puras: la interfaz las usa para decidir qué botones mostrar y el adaptador mock para rechazar
 * lo que el backend rechazaría. Solo preguntan permisos, nunca el nombre del rol.
 */
import { can } from '@/shared/permissions';
import type { Role } from '@/shared/roles';

import { AUTO_CLOSE_DAYS, type Ticket } from './tickets.schemas';

export type Viewer = { id: string; name: string; role: Role };

export type TicketAction =
  | { type: 'take' }
  | { type: 'assign'; assigneeId: string }
  | { type: 'resolve'; solution: string }
  | { type: 'reopen' }
  | { type: 'confirm' }
  | { type: 'close' };

export type TicketActionType = TicketAction['type'];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Acciones que el usuario puede hacer ahora sobre el ticket. */
export function availableActions(ticket: Ticket, viewer: Viewer | null | undefined): Set<TicketActionType> {
  const actions = new Set<TicketActionType>();
  if (!viewer) return actions;

  const handles = can(viewer.role, 'tickets', 'handle');
  const isAssignee = ticket.assignee?.id === viewer.id;
  const isRequester = ticket.requester.id === viewer.id;
  const isActive = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';

  if (handles && isActive && !ticket.assignee) actions.add('take');
  if (can(viewer.role, 'tickets', 'assign') && isActive) actions.add('assign');
  if (isAssignee && ticket.status === 'IN_PROGRESS') actions.add('resolve');
  if (isRequester && ticket.status === 'RESOLVED') {
    actions.add('confirm');
    actions.add('reopen');
  }
  if (can(viewer.role, 'tickets', 'close') && ticket.status !== 'CLOSED') actions.add('close');

  return actions;
}

/** Momento en que un ticket resuelto se cierra solo; null si no está resuelto. */
export function autoCloseAt(ticket: Ticket): Date | null {
  if (ticket.status !== 'RESOLVED' || !ticket.resolvedAt) return null;
  return new Date(new Date(ticket.resolvedAt).getTime() + AUTO_CLOSE_DAYS * DAY_MS);
}

/** Notas internas visibles: solo para quien atiende tickets. */
export function canSeeInternalNotes(viewer: Viewer | null | undefined): boolean {
  return !!viewer && can(viewer.role, 'tickets', 'handle');
}
