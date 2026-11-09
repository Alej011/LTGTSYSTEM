"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivityComponent } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { getDashboardStats, getRecentActivity, type DashboardStats, type RecentActivity } from "@/lib/features/dashboard/dashboard.service"
import { Building2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TONE_CLASSES } from "@/lib/shared/tones"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const dashboardStats = await getDashboardStats(user.id, user.role, user.department || "")
        const activity = getRecentActivity(user.id, user.role, user.department || "")

        setStats(dashboardStats)
        setRecentActivity(activity)
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (!user) return null
  if (isLoading || !stats) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: TONE_CLASSES.primary,
      empleado: TONE_CLASSES.info,
    }
    return colors[role as keyof typeof colors] || colors.empleado
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrador",
      empleado: "Empleado de Soporte",
    }
    return labels[role as keyof typeof labels] || role
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard LTGT S.A.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <p>Bienvenido, {user.name}</p>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
          </div>
        </div>
        <div className="sm:text-right">
          <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">{user.department}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} userRole={user.role} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivityComponent activities={recentActivity} />

        {/* Quick Actions */}
        <QuickActions userRole={user.role} />
      </div>

      {/* System Status */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true"></div>
            <div>
              <p className="font-medium">Servicios Principales</p>
              <p className="text-sm text-muted-foreground">Operativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true"></div>
            <div>
              <p className="font-medium">Base de Datos</p>
              <p className="text-sm text-muted-foreground">Conectado</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true"></div>
            <div>
              <p className="font-medium">Red Interna</p>
              <p className="text-sm text-muted-foreground">Estable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
