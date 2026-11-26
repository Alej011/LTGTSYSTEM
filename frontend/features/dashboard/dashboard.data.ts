/**
 * Cifras y actividad del dashboard que vienen de comunicaciones, el único módulo con datos simulados síncronos.
 * Productos, tickets y conocimiento cargan sus propios datos con sus hooks.
 * Cuando comunicaciones pase a hooks asíncronos (C.8) estas funciones se reemplazan.
 */
import type { Article } from '@/features/knowledge/knowledge.schemas';
import type { Ticket, TicketStatus } from '@/features/tickets/tickets.schemas';
import { getCommunications, getUnreadCount } from '@/lib/features/communications/communications.service';
import type { SessionUser } from '@/shared/session/session.client';

// El backend no tiene departamentos de usuario; con un departamento vacío el mock no filtra por él
const NO_DEPARTMENT = '';

export interface DashboardStats {
  unreadCommunications: number;
}

export interface RecentActivity {
  id: string;
  type: 'ticket' | 'product' | 'communication' | 'knowledge';
  title: string;
  description: string;
  time: Date;
  ticketStatus?: TicketStatus;
  status?: string;
}

export function getDashboardStats(user: SessionUser): DashboardStats {
  return { unreadCommunications: getUnreadCount(user.id, user.role, NO_DEPARTMENT) };
}

/** Tickets y artículos llegan de sus hooks; mientras cargan pueden ser listas vacías. */
export function getRecentActivity(
  user: SessionUser,
  recentTickets: Ticket[],
  recentArticles: Article[],
): RecentActivity[] {
  const activities: RecentActivity[] = recentTickets.map((ticket) => ({
    id: ticket.id,
    type: 'ticket',
    title: `Ticket #${ticket.id}: ${ticket.title}`,
    description: ticket.requester.name,
    time: new Date(ticket.updatedAt),
    ticketStatus: ticket.status,
  }));

  // Recent communications
  const communications = getCommunications(user.id, user.role, NO_DEPARTMENT).slice(0, 2);
  communications.forEach((comm) => {
    activities.push({
      id: comm.id,
      type: 'communication',
      title: comm.title,
      description: `${comm.authorName} - ${comm.type}`,
      time: comm.publishedAt || comm.createdAt,
      status: comm.type,
    });
  });

  recentArticles.forEach((article) => {
    activities.push({
      id: article.id,
      type: 'knowledge',
      title: article.title,
      description: article.author?.name ?? 'Base de conocimientos',
      time: new Date(article.updatedAt),
    });
  });

  // Sort by time and return top 8
  return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);
}
