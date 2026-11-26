/**
 * Interfaz del dominio de tickets para los componentes.
 * Los hooks esconden el adaptador de datos, las query keys y la invalidación de caché.
 * Un solo modo de error: toda falla llega como ApiClientError (en `error` o en el rechazo de la mutación).
 * Hoy los datos vienen de tickets.mock.ts; con el módulo real del backend solo cambia `adapter`.
 */
import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiClientError } from '@/shared/api/api-client';
import { useSession } from '@/shared/session/session.client';

import { ticketsMock } from './tickets.mock';
import type { TicketAction, Viewer } from './tickets.rules';
import type { CommentInput, Ticket, TicketFilters, TicketInput } from './tickets.schemas';

const adapter = ticketsMock;

const ticketKeys = {
  all: ['tickets'] as const,
  // La lista depende del usuario (filtro "mis tickets"), por eso lleva su id
  list: (viewerId: string, filters: TicketFilters) => [...ticketKeys.all, 'list', viewerId, filters] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
  comments: (id: string, viewerId: string) => [...ticketKeys.all, 'comments', id, viewerId] as const,
  assignable: () => [...ticketKeys.all, 'assignable'] as const,
};

/** Usuario de la sesión como lo necesitan las reglas de tickets. */
export function useViewer(): Viewer | null {
  const { user } = useSession();
  return user ? { id: user.id, name: user.name, role: user.role } : null;
}

function requireViewer(viewer: Viewer | null): Viewer {
  if (!viewer) throw new ApiClientError('Sesión expirada. Por favor inicia sesión nuevamente.', 401);
  return viewer;
}

/** Tickets que cumplen los filtros, del más reciente al más antiguo. Mientras filtra se sigue mostrando la lista anterior. */
export function useTickets(filters: TicketFilters = {}) {
  const viewer = useViewer();
  return useQuery({
    queryKey: ticketKeys.list(viewer?.id ?? '', filters),
    queryFn: viewer ? () => adapter.list(filters, viewer) : skipToken,
    placeholderData: keepPreviousData,
  });
}

// null significa "no existe"; cualquier otra falla se propaga
async function fetchTicket(id: string): Promise<Ticket | null> {
  try {
    return await adapter.get(id);
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) return null;
    throw error;
  }
}

/** Detalle de un ticket; `data` es null si no existe. Con id null no hace ninguna petición. */
export function useTicket(id: string | null) {
  return useQuery({
    queryKey: ticketKeys.detail(id ?? ''),
    queryFn: id ? () => fetchTicket(id) : skipToken,
  });
}

/** Comentarios del ticket en orden cronológico; las notas internas solo llegan a quien atiende tickets. */
export function useTicketComments(ticketId: string) {
  const viewer = useViewer();
  return useQuery({
    queryKey: ticketKeys.comments(ticketId, viewer?.id ?? ''),
    queryFn: viewer ? () => adapter.comments(ticketId, viewer) : skipToken,
  });
}

/** Usuarios que pueden ser asignados a un ticket. Con enabled false no hace ninguna petición. */
export function useAssignableUsers(enabled = true) {
  const viewer = useViewer();
  return useQuery({
    queryKey: ticketKeys.assignable(),
    queryFn: viewer && enabled ? () => adapter.assignableUsers(viewer) : skipToken,
  });
}

/** Abre un ticket a nombre del usuario de la sesión. */
export function useCreateTicket() {
  const viewer = useViewer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TicketInput) => adapter.create(input, requireViewer(viewer)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

/** Tomar, asignar, resolver, confirmar, reabrir o cerrar. Las acciones válidas las da availableActions. */
export function useTicketAction() {
  const viewer = useViewer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: TicketAction }) =>
      adapter.act(id, action, requireViewer(viewer)),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
      return queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
  });
}

export function useAddComment(ticketId: string) {
  const viewer = useViewer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CommentInput) => adapter.addComment(ticketId, input, requireViewer(viewer)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...ticketKeys.all, 'comments', ticketId] }),
  });
}

export type TicketSummary = { active: number; assignedToMe: number };

/** Tickets activos (abiertos o en progreso) y cuántos de ellos tiene asignados el usuario. */
export function useTicketSummary() {
  const viewer = useViewer();
  return useQuery({
    queryKey: ticketKeys.list(viewer?.id ?? '', {}),
    queryFn: viewer ? () => adapter.list({}, viewer) : skipToken,
    select: (tickets): TicketSummary => {
      const active = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
      return { active: active.length, assignedToMe: active.filter((t) => t.assignee?.id === viewer?.id).length };
    },
  });
}

/** Los tickets con actividad más reciente. */
export function useRecentTickets(limit: number) {
  const viewer = useViewer();
  return useQuery({
    queryKey: ticketKeys.list(viewer?.id ?? '', {}),
    queryFn: viewer ? () => adapter.list({}, viewer) : skipToken,
    select: (tickets) => [...tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit),
  });
}
