import { fetchStockSummary } from '@/features/products/products.client';
import type { UserRole } from '@/lib/features/auth/auth.service';
import { getCommunications, getUnreadCount } from '@/lib/features/communications/communications.service';
import { getArticles } from '@/lib/features/knowledge/knowledge.service';
import { getTickets } from '@/lib/features/tickets/tickets.service';

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
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

export const getDashboardStats = async (
  userId: string,
  userRole: UserRole,
  userDepartment: string,
): Promise<DashboardStats> => {
  const stock = await fetchStockSummary();

  const tickets = getTickets();
  const articles = getArticles('published');
  const unreadComms = getUnreadCount(userId, userRole, userDepartment);

  const openTickets = tickets.filter((t) => t.status === 'abierto' || t.status === 'en_progreso').length;
  const myTickets = tickets.filter((t) => t.createdBy === userId || t.assignedTo === userId).length;

  return {
    totalProducts: stock.total,
    lowStockProducts: stock.lowStock,
    openTickets,
    myTickets,
    knowledgeArticles: articles.length,
    unreadCommunications: unreadComms,
  };
};

export const getRecentActivity = (userId: string, userRole: UserRole, userDepartment: string): RecentActivity[] => {
  const activities: RecentActivity[] = [];

  // Recent tickets
  const tickets = getTickets()
    .filter((t) => {
      if (userRole === 'empleado') return t.createdBy === userId || t.assignedTo === userId;
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
  const communications = getCommunications(userId, userRole, userDepartment).slice(0, 2);
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
};
