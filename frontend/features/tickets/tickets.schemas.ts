/**
 * Modelo de tickets definido en docs/roles-y-permisos.md (sección 5). El backend todavía no tiene el módulo,
 * así que estos tipos se escriben aquí; cuando exista pasan a salir de ApiSchemas con matchesContract.
 */
import { z } from 'zod';

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const TICKET_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'OTHER'] as const;
export const CLOSE_REASONS = ['CONFIRMED', 'AUTO', 'ADMIN'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type CloseReason = (typeof CLOSE_REASONS)[number];

/** Días corridos que tiene el solicitante para confirmar o reabrir un ticket resuelto antes del cierre automático. */
export const AUTO_CLOSE_DAYS = 3;

export type Person = { id: string; name: string };

// Fechas como texto ISO, igual que en el JSON del backend
export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requester: Person;
  assignee: Person | null;
  solution: string | null;
  closeReason: CloseReason | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
};

/** author es null si el usuario que lo escribió ya no existe. Las notas internas solo las ve quien atiende tickets. */
export type TicketComment = {
  id: string;
  ticketId: string;
  author: Person | null;
  content: string;
  isInternal: boolean;
  createdAt: string;
};

export type TicketFilters = {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  /** mine: el usuario es solicitante o asignado. unassigned: sin asignar. */
  assignment?: 'mine' | 'unassigned';
};

export const TicketFormSchema = z.object({
  title: z.string().trim().min(1, 'Ingresa el título del problema'),
  description: z.string().trim().min(1, 'Describe el problema'),
  category: z.enum(TICKET_CATEGORIES, 'Selecciona una categoría'),
  priority: z.enum(TICKET_PRIORITIES, 'Selecciona una prioridad'),
});

export type TicketInput = z.infer<typeof TicketFormSchema>;

export const SolutionSchema = z.string().trim().min(1, 'Describe la solución aplicada');

export const CommentSchema = z.object({
  content: z.string().trim().min(1, 'Escribe un comentario'),
  isInternal: z.boolean(),
});

export type CommentInput = z.infer<typeof CommentSchema>;
