import { getProductsWithBrands } from "./products"
import { getTickets } from "./tickets"
import { getArticles } from "./knowledge"
import { getCommunications, getUnreadCount } from "./communications"
import type { UserRole } from "./auth"

export interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  openTickets: number
  myTickets: number
  knowledgeArticles: number
  unreadCommunications: number
}

export interface RecentActivity {
  id: string
  type: "ticket" | "product" | "communication" | "knowledge"
  title: string
  description: string
  time: Date
  status?: string
  priority?: string
}

export const getDashboardStats = (userId: string, userRole: UserRole, userDepartment: string): DashboardStats => {
  const products = getProductsWithBrands()
  const tickets = getTickets()
  const articles = getArticles("published")
  const unreadComms = getUnreadCount(userId, userRole, userDepartment)

  const lowStockProducts = products.filter((p) => p.stock <= 5).length
  const openTickets = tickets.filter((t) => t.status === "abierto" || t.status === "en_progreso").length
  const myTickets = tickets.filter((t) => t.createdBy === userId || t.assignedTo === userId).length

  return {
    totalProducts: products.length,
    lowStockProducts,
    openTickets,
    myTickets,
    knowledgeArticles: articles.length,
    unreadCommunications: unreadComms,
  }
}

export const getRecentActivity = (userId: string, userRole: UserRole, userDepartment: string): RecentActivity[] => {
  const activities: RecentActivity[] = []

  // Recent tickets
  const tickets = getTickets()
    .filter((t) => {
      if (userRole === "empleado") return t.createdBy === userId || t.assignedTo === userId
      return true
    })
    .slice(0, 3)

  tickets.forEach((ticket) => {
    activities.push({
      id: ticket.id,
      type: "ticket",
      title: `Ticket #${ticket.id}: ${ticket.title}`,
      description: `${ticket.createdByName} - ${ticket.category}`,
      time: ticket.updatedAt,
      status: ticket.status,
      priority: ticket.priority,
    })
  })

  // Recent communications
  const communications = getCommunications(userId, userRole, userDepartment).slice(0, 2)
  communications.forEach((comm) => {
    activities.push({
      id: comm.id,
      type: "communication",
      title: comm.title,
      description: `${comm.authorName} - ${comm.type}`,
      time: comm.publishedAt || comm.createdAt,
      status: comm.type,
    })
  })

  // Recent knowledge articles
  const articles = getArticles("published").slice(0, 2)
  articles.forEach((article) => {
    activities.push({
      id: article.id,
      type: "knowledge",
      title: article.title,
      description: `${article.authorName} - ${article.category}`,
      time: article.updatedAt,
    })
  })

  // Sort by time and return top 8
  return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8)
}

export const getQuickActions = (userRole: UserRole) => {
  const allActions = [
    {
      title: "Crear Ticket",
      description: "Reportar problema técnico",
      href: "/tickets",
      icon: "Headphones",
      color: "text-orange-600",
      roles: ["empleado", "admin"],
    },
    {
      title: "Ver Productos",
      description: "Consultar catálogo",
      href: "/products",
      icon: "Package",
      color: "text-blue-600",
      roles: ["empleado", "admin"],
    },
    {
      title: "Base Conocimientos",
      description: "Buscar soluciones",
      href: "/knowledge",
      icon: "BookOpen",
      color: "text-green-600",
      roles: ["empleado", "admin"],
    },
    {
      title: "Comunicaciones",
      description: "Ver novedades",
      href: "/communications",
      icon: "MessageSquare",
      color: "text-purple-600",
      roles: ["empleado", "admin"],
    },
    {
      title: "Gestionar Usuarios",
      description: "Administrar personal",
      href: "/users",
      icon: "Users",
      color: "text-indigo-600",
      roles: ["admin"],
    },
    {
      title: "Tickets Pendientes",
      description: "Resolver incidencias",
      href: "/tickets",
      icon: "AlertCircle",
      color: "text-red-600",
      roles: ["empleado", "admin"],
    },
  ]

  return allActions.filter((action) => action.roles.includes(userRole))
}
