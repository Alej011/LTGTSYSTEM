/**
 * Adaptador en memoria de tickets: se comporta como lo hará el BFF (asíncrono, fechas ISO, errores como
 * ApiClientError) y aplica las mismas reglas que tendrá el backend. Los datos viven mientras la página no se recargue.
 * Cuando exista el módulo real, tickets.client.ts cambia este adaptador por uno HTTP y los componentes no cambian.
 */
import { ApiClientError } from '@/shared/api/api-client';
import { can } from '@/shared/permissions';

import { autoCloseAt, availableActions, canSeeInternalNotes, type TicketAction, type Viewer } from './tickets.rules';
import {
  type CommentInput,
  type Person,
  type Ticket,
  type TicketComment,
  type TicketFilters,
  type TicketInput,
} from './tickets.schemas';

// Sin espera en los tests; en desarrollo imita la latencia de la red para que se vean los estados de carga
const LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

type KnownPerson = Person & { canHandle: boolean };

type State = { tickets: Ticket[]; comments: TicketComment[]; people: KnownPerson[]; nextId: number };

const HOUR_MS = 60 * 60 * 1000;
const ago = (hours: number) => new Date(Date.now() - hours * HOUR_MS).toISOString();

// Las fechas son relativas al momento de carga para que el ticket resuelto no se cierre solo al abrir la app
function seed(): State {
  const ana = { id: 'mock-ana', name: 'Ana López' };
  const carlos = { id: 'mock-carlos', name: 'Carlos Rodríguez' };
  const juan = { id: 'mock-juan', name: 'Juan Pérez' };
  const maria = { id: 'mock-maria', name: 'María García' };

  const base = { solution: null, closeReason: null, resolvedAt: null, closedAt: null };
  const tickets: Ticket[] = [
    {
      ...base,
      id: '1004',
      title: 'No puedo acceder al sistema de correo',
      description: 'Desde esta mañana no puedo iniciar sesión en Outlook. Me aparece un error de credenciales.',
      category: 'SOFTWARE',
      priority: 'HIGH',
      status: 'OPEN',
      requester: ana,
      assignee: null,
      createdAt: ago(3),
      updatedAt: ago(3),
    },
    {
      ...base,
      id: '1003',
      title: 'Impresora no funciona en el departamento de ventas',
      description: 'La impresora del segundo piso no responde. Las luces están encendidas pero no imprime.',
      category: 'HARDWARE',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      requester: ana,
      assignee: juan,
      createdAt: ago(26),
      updatedAt: ago(20),
    },
    {
      ...base,
      id: '1002',
      title: 'Internet lento en toda la oficina',
      description: 'Desde ayer la conexión a internet está muy lenta. Afecta el trabajo de todo el equipo.',
      category: 'NETWORK',
      priority: 'CRITICAL',
      status: 'RESOLVED',
      requester: carlos,
      assignee: maria,
      solution: 'Se reinició el router principal y se optimizó la configuración de ancho de banda.',
      createdAt: ago(50),
      updatedAt: ago(30),
      resolvedAt: ago(30),
    },
    {
      ...base,
      id: '1001',
      title: 'Solicitud de acceso a la carpeta de contabilidad',
      description: 'Necesito acceso de lectura a la carpeta compartida de contabilidad para el cierre de mes.',
      category: 'ACCESS',
      priority: 'LOW',
      status: 'CLOSED',
      requester: carlos,
      assignee: juan,
      solution: 'Se otorgó acceso de lectura al grupo de contabilidad.',
      closeReason: 'CONFIRMED',
      createdAt: ago(120),
      updatedAt: ago(96),
      resolvedAt: ago(100),
      closedAt: ago(96),
    },
  ];

  const comments: TicketComment[] = [
    {
      id: 'c1',
      ticketId: '1003',
      author: juan,
      content: 'Revisé la impresora. Parece un problema de conectividad; voy a revisar los cables.',
      isInternal: false,
      createdAt: ago(22),
    },
    {
      id: 'c2',
      ticketId: '1003',
      author: juan,
      content: 'El puerto del switch del segundo piso está marcando errores. Pedir reemplazo si persiste.',
      isInternal: true,
      createdAt: ago(20),
    },
    {
      id: 'c3',
      ticketId: '1002',
      author: maria,
      content: 'Reinicié el router y ajusté la configuración. ¿Pueden confirmar si ya mejoró?',
      isInternal: false,
      createdAt: ago(30),
    },
  ];

  const people: KnownPerson[] = [
    { ...ana, canHandle: false },
    { ...carlos, canHandle: false },
    { ...juan, canHandle: true },
    { ...maria, canHandle: true },
  ];

  return { tickets, comments, people, nextId: 1005 };
}

let state = seed();

/** Vuelve a los datos iniciales. Para los tests. */
export function resetTicketsMock(): void {
  state = seed();
}

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
const now = () => new Date().toISOString();
const clone = <T>(value: T): T => structuredClone(value);
const person = (viewer: Viewer): Person => ({ id: viewer.id, name: viewer.name });

// El usuario de la sesión no está en los datos simulados; se registra al actuar para poder asignarlo
function remember(viewer: Viewer): void {
  const known = state.people.find((p) => p.id === viewer.id);
  const canHandle = can(viewer.role, 'tickets', 'handle');
  if (known) Object.assign(known, { name: viewer.name, canHandle });
  else state.people.push({ ...person(viewer), canHandle });
}

// Lo que haría la tarea programada del backend: cerrar los resueltos sin respuesta
function closeExpired(): void {
  const current = Date.now();
  for (const ticket of state.tickets) {
    const closesAt = autoCloseAt(ticket);
    if (closesAt && closesAt.getTime() <= current) {
      Object.assign(ticket, {
        status: 'CLOSED',
        closeReason: 'AUTO',
        closedAt: closesAt.toISOString(),
        updatedAt: closesAt.toISOString(),
      });
    }
  }
}

function findTicket(id: string): Ticket {
  const ticket = state.tickets.find((t) => t.id === id);
  if (!ticket) throw new ApiClientError('El ticket no existe', 404);
  return ticket;
}

function matches(ticket: Ticket, filters: TicketFilters, viewer: Viewer): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (
    search &&
    ![ticket.title, ticket.description, ticket.requester.name].some((text) => text.toLowerCase().includes(search))
  ) {
    return false;
  }
  if (filters.status && ticket.status !== filters.status) return false;
  if (filters.priority && ticket.priority !== filters.priority) return false;
  if (filters.assignment === 'unassigned' && ticket.assignee) return false;
  if (filters.assignment === 'mine' && ticket.requester.id !== viewer.id && ticket.assignee?.id !== viewer.id) {
    return false;
  }
  return true;
}

function apply(ticket: Ticket, action: TicketAction, viewer: Viewer): void {
  const at = now();
  switch (action.type) {
    case 'take':
      ticket.assignee = person(viewer);
      ticket.status = 'IN_PROGRESS';
      break;
    case 'assign': {
      const assignee = state.people.find((p) => p.id === action.assigneeId && p.canHandle);
      if (!assignee) throw new ApiClientError('Solo se puede asignar a quien atiende tickets', 409);
      ticket.assignee = { id: assignee.id, name: assignee.name };
      ticket.status = 'IN_PROGRESS';
      break;
    }
    case 'resolve': {
      const solution = action.solution.trim();
      if (!solution) throw new ApiClientError('La solución es obligatoria', 400);
      Object.assign(ticket, { status: 'RESOLVED', solution, resolvedAt: at });
      break;
    }
    case 'reopen':
      Object.assign(ticket, { status: 'IN_PROGRESS', solution: null, resolvedAt: null });
      break;
    case 'confirm':
      Object.assign(ticket, { status: 'CLOSED', closeReason: 'CONFIRMED', closedAt: at });
      break;
    case 'close':
      Object.assign(ticket, { status: 'CLOSED', closeReason: 'ADMIN', closedAt: at });
      break;
  }
  ticket.updatedAt = at;
}

export const ticketsMock = {
  /** Tickets que cumplen los filtros, del más reciente al más antiguo. */
  async list(filters: TicketFilters, viewer: Viewer): Promise<Ticket[]> {
    await delay();
    closeExpired();
    const result = state.tickets
      .filter((ticket) => matches(ticket, filters, viewer))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return clone(result);
  },

  async get(id: string): Promise<Ticket> {
    await delay();
    closeExpired();
    return clone(findTicket(id));
  },

  async create(input: TicketInput, viewer: Viewer): Promise<Ticket> {
    await delay();
    if (!can(viewer.role, 'tickets', 'create')) throw new ApiClientError('Sin permiso', 403);
    remember(viewer);
    const at = now();
    const ticket: Ticket = {
      ...input,
      id: String(state.nextId++),
      status: 'OPEN',
      requester: person(viewer),
      assignee: null,
      solution: null,
      closeReason: null,
      createdAt: at,
      updatedAt: at,
      resolvedAt: null,
      closedAt: null,
    };
    state.tickets.push(ticket);
    return clone(ticket);
  },

  /** Aplica una transición; responde 409 si no está disponible para este usuario en el estado actual. */
  async act(id: string, action: TicketAction, viewer: Viewer): Promise<Ticket> {
    await delay();
    closeExpired();
    remember(viewer);
    const ticket = findTicket(id);
    if (!availableActions(ticket, viewer).has(action.type)) {
      throw new ApiClientError('Esta acción ya no está disponible para el ticket', 409);
    }
    apply(ticket, action, viewer);
    return clone(ticket);
  },

  /** Comentarios en orden cronológico; las notas internas solo para quien atiende tickets. */
  async comments(ticketId: string, viewer: Viewer): Promise<TicketComment[]> {
    await delay();
    findTicket(ticketId);
    const showInternal = canSeeInternalNotes(viewer);
    return clone(
      state.comments
        .filter((c) => c.ticketId === ticketId && (showInternal || !c.isInternal))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    );
  },

  async addComment(ticketId: string, input: CommentInput, viewer: Viewer): Promise<TicketComment> {
    await delay();
    const ticket = findTicket(ticketId);
    if (!can(viewer.role, 'tickets', 'comment') || ticket.status === 'CLOSED') {
      throw new ApiClientError('No se puede comentar este ticket', 409);
    }
    if (input.isInternal && !canSeeInternalNotes(viewer)) throw new ApiClientError('Sin permiso', 403);
    remember(viewer);
    const comment: TicketComment = {
      id: `c${state.comments.length + 1}-${Date.now()}`,
      ticketId,
      author: person(viewer),
      content: input.content.trim(),
      isInternal: input.isInternal,
      createdAt: now(),
    };
    state.comments.push(comment);
    return clone(comment);
  },

  /** Usuarios a los que se puede asignar un ticket: los que atienden tickets. */
  async assignableUsers(viewer: Viewer): Promise<Person[]> {
    await delay();
    remember(viewer);
    return state.people
      .filter((p) => p.canHandle)
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
};

export type TicketsAdapter = typeof ticketsMock;
