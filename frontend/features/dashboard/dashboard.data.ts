/**
 * Cifras y actividad del dashboard que vienen de módulos con datos simulados síncronos
 * (conocimiento y comunicaciones). Productos y tickets cargan sus propios datos con sus hooks.
 * Cuando esos dos módulos pasen a hooks asíncronos (C.8) estas funciones se reemplazan.
 */
import type { Ticket, TicketStatus } from '@/features/tickets/tickets.schemas';
import { getCommunications, getUnreadCount } from '@/lib/features/communications/communications.service';
import { getArticles } from '@/lib/features/knowledge/knowledge.service';
import type { SessionUser } from '@/shared/session/session.client';

// El backend no tiene departamentos de usuario; con un departamento vacío el mock no filtra por él
const NO_DEPARTMENT = '';

export interface DashboardStats {
  knowledgeArticles: number;
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
  const articles = getArticles('published');
  const unreadComms = getUnreadCount(user.id, user.role, NO_DEPARTMENT);

  return {
    knowledgeArticles: articles.length,
    unreadCommunications: unreadComms,
  };
}

/** recentTickets llega de useRecentTickets; mientras carga puede ser una lista vacía. */
export function getRecentActivity(user: SessionUser, recentTickets: Ticket[]): RecentActivity[] {
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

  // Recent knowledge articles
  const articles = getArticles('published').slice(0, 2);
  articles.forEach((article) => {
    activities.push({
      id: article.id,
      type: 'knowledge',
      title: article.title,
      description: `${article.authorName} - ${article.category}`,
      time: article.updatedAt,
    });
  });

  // Sort by time and return top 8
  return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);
}
