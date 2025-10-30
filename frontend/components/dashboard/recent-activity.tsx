"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Headphones, Package, MessageSquare, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { RecentActivity } from "@/lib/dashboard"

interface RecentActivityProps {
  activities: RecentActivity[]
}

export function RecentActivityComponent({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <Headphones className="h-4 w-4 text-orange-600" />
      case "product":
        return <Package className="h-4 w-4 text-blue-600" />
      case "communication":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case "knowledge":
        return <BookOpen className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (activity: RecentActivity) => {
    if (activity.type === "ticket" && activity.status) {
      const statusColors = {
        abierto: "bg-blue-50 text-blue-600",
        en_progreso: "bg-yellow-50 text-yellow-600",
        resuelto: "bg-green-50 text-green-600",
        cerrado: "bg-gray-50 text-gray-600",
      }
      const statusLabels = {
        abierto: "Abierto",
        en_progreso: "En Progreso",
        resuelto: "Resuelto",
        cerrado: "Cerrado",
      }
      return (
        <Badge variant="outline" className={statusColors[activity.status as keyof typeof statusColors]}>
          {statusLabels[activity.status as keyof typeof statusLabels]}
        </Badge>
      )
    }

    if (activity.type === "ticket" && activity.priority) {
      const priorityColors = {
        baja: "bg-green-50 text-green-600",
        media: "bg-yellow-50 text-yellow-600",
        alta: "bg-orange-50 text-orange-600",
        critica: "bg-red-50 text-red-600",
      }
      return (
        <Badge variant="outline" className={priorityColors[activity.priority as keyof typeof priorityColors]}>
          <span className="capitalize">{activity.priority}</span>
        </Badge>
      )
    }

    if (activity.type === "communication" && activity.status) {
      const typeColors = {
        anuncio: "bg-blue-50 text-blue-600",
        politica: "bg-purple-50 text-purple-600",
        evento: "bg-green-50 text-green-600",
        urgente: "bg-red-50 text-red-600",
        general: "bg-gray-50 text-gray-600",
      }
      const typeLabels = {
        anuncio: "Anuncio",
        politica: "Política",
        evento: "Evento",
        urgente: "Urgente",
        general: "General",
      }
      return (
        <Badge variant="outline" className={typeColors[activity.status as keyof typeof typeColors]}>
          {typeLabels[activity.status as keyof typeof typeLabels]}
        </Badge>
      )
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas actualizaciones del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay actividad reciente</p>
          ) : (
            activities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">{getIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(activity.time, { addSuffix: true, locale: es })}
                    </p>
                    {getStatusBadge(activity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
