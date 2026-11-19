/**
 * Cifras y actividad del dashboard que vienen de módulos con datos simulados síncronos
 * (tickets, conocimiento, comunicaciones). Los totales de productos vienen de useStockSummary.
 * En C.8 estos módulos pasan a hooks asíncronos y estas funciones se reemplazan.
 */
import type { User } from '@/lib/features/auth/auth.service';
import { getCommunications, getUnreadCount } from '@/lib/features/communications/communications.service';
import { getArticles } from '@/lib/features/knowledge/knowledge.service';
import { getTickets } from '@/lib/features/tickets/tickets.service';

export interface DashboardStats {
  openTickets: number;
  myTickets: number;
  knowledgeArticles: number;
  unreadCommunications: number;
}

export interface RecentActivity {
  id: string;
  type: 'ticket' | 'product' | 'communication' | 'knowledge';
  title: string;
  description: string;
  time: Date;
  status?: string;
  priority?: string;
}

export function getDashboardStats(user: User): DashboardStats {
  const tickets = getTickets();
  const articles = getArticles('published');
  const unreadComms = getUnreadCount(user.id, user.role, user.department ?? '');

  const openTickets = tickets.filter((t) => t.status === 'abierto' || t.status === 'en_progreso').length;
  const myTickets = tickets.filter((t) => t.createdBy === user.id || t.assignedTo === user.id).length;

  return {
    openTickets,
    myTickets,
    knowledgeArticles: articles.length,
    unreadCommunications: unreadComms,
  };
}

export function getRecentActivity(user: User): RecentActivity[] {
  const activities: RecentActivity[] = [];

  // Recent tickets
  const tickets = getTickets()
    .filter((t) => {
      if (user.role === 'empleado') return t.createdBy === user.id || t.assignedTo === user.id;
      return true;
    })
    .slice(0, 3);

  tickets.forEach((ticket) => {
    activities.push({
      id: ticket.id,
      type: 'ticket',
      title: `Ticket #${ticket.id}: ${ticket.title}`,
      description: `${ticket.createdByName} - ${ticket.category}`,
      time: ticket.updatedAt,
      status: ticket.status,
      priority: ticket.priority,
    });
  });

  // Recent communications
  const communications = getCommunications(user.id, user.role, user.department ?? '').slice(0, 2);
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
