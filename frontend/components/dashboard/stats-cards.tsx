"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Headphones, BookOpen, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react"
import type { DashboardStats } from "@/lib/dashboard"

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
      color: "text-blue-600",
      show: ["admin", "empleado"].includes(userRole),
    },
    {
      title: "Tickets Abiertos",
      value: stats.openTickets.toString(),
      change: stats.myTickets > 0 ? `${stats.myTickets} asignados a ti` : "Sin tickets asignados",
      icon: Headphones,
      color: "text-orange-600",
      show: true,
    },
    {
      title: "Artículos KB",
      value: stats.knowledgeArticles.toString(),
      change: "Soluciones disponibles",
      icon: BookOpen,
      color: "text-green-600",
      show: true,
    },
    {
      title: "Comunicaciones",
      value: stats.unreadCommunications.toString(),
      change: stats.unreadCommunications > 0 ? "Sin leer" : "Todo leído",
      icon: MessageSquare,
      color: "text-purple-600",
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
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-2 mt-1">
                {card.title === "Productos Totales" && stats.lowStockProducts > 0 && (
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                )}
                {card.title === "Comunicaciones" && stats.unreadCommunications === 0 && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
                <p className="text-xs text-muted-foreground">{card.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
