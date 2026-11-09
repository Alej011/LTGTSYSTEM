"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Headphones, BookOpen, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react"
import type { DashboardStats } from "@/lib/features/dashboard/dashboard.service"

interface StatsCardsProps {
  stats: DashboardStats
  userRole: string
}

export function StatsCards({ stats, userRole }: StatsCardsProps) {
  const cards = [
    {
      title: "Productos Totales",
      value: stats.totalProducts.toString(),
      change: stats.lowStockProducts > 0 ? `${stats.lowStockProducts} con stock bajo` : "Stock normal",
      icon: Package,
      show: ["admin", "empleado"].includes(userRole),
    },
    {
      title: "Tickets Abiertos",
      value: stats.openTickets.toString(),
      change: stats.myTickets > 0 ? `${stats.myTickets} asignados a ti` : "Sin tickets asignados",
      icon: Headphones,
      show: true,
    },
    {
      title: "Artículos KB",
      value: stats.knowledgeArticles.toString(),
      change: "Soluciones disponibles",
      icon: BookOpen,
      show: true,
    },
    {
      title: "Comunicaciones",
      value: stats.unreadCommunications.toString(),
      change: stats.unreadCommunications > 0 ? "Sin leer" : "Todo leído",
      icon: MessageSquare,
      show: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards
        .filter((card) => card.show)
        .map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <div className="flex items-center gap-2 mt-1">
                {card.title === "Productos Totales" && stats.lowStockProducts > 0 && (
                  <AlertTriangle className="h-3 w-3 text-warning" />
                )}
                {card.title === "Comunicaciones" && stats.unreadCommunications === 0 && (
                  <CheckCircle className="h-3 w-3 text-success" />
                )}
                <p className="text-xs text-muted-foreground">{card.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
