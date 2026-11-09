"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Headphones, Package, MessageSquare, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { RecentActivity } from "@/lib/features/dashboard/dashboard.service"
import { TONE_CLASSES } from "@/lib/shared/tones"

interface RecentActivityProps {
  activities: RecentActivity[]
}

export function RecentActivityComponent({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <Headphones className="h-4 w-4" />
      case "product":
        return <Package className="h-4 w-4" />
      case "communication":
        return <MessageSquare className="h-4 w-4" />
      case "knowledge":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (activity: RecentActivity) => {
    if (activity.type === "ticket" && activity.status) {
      const statusColors = {
        abierto: TONE_CLASSES.info,
        en_progreso: TONE_CLASSES.warning,
        resuelto: TONE_CLASSES.success,
        cerrado: TONE_CLASSES.neutral,
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
        baja: TONE_CLASSES.neutral,
        media: TONE_CLASSES.info,
        alta: TONE_CLASSES.warning,
        critica: TONE_CLASSES.danger,
      }
      return (
        <Badge variant="outline" className={priorityColors[activity.priority as keyof typeof priorityColors]}>
          <span className="capitalize">{activity.priority}</span>
        </Badge>
      )
    }

    if (activity.type === "communication" && activity.status) {
      const typeColors = {
        anuncio: TONE_CLASSES.info,
        politica: TONE_CLASSES.primary,
        evento: TONE_CLASSES.success,
        urgente: TONE_CLASSES.danger,
        general: TONE_CLASSES.neutral,
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">{getIcon(activity.type)}</div>
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
