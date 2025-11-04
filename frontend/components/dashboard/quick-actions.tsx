"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Package,
  Headphones,
  BookOpen,
  MessageSquare,
  Users,
  AlertCircle,
  ArrowRight,
  Plus,
  Search,
} from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/lib/features/auth/auth.service"

interface QuickActionsProps {
  userRole: UserRole
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const getIcon = (iconName: string) => {
    const icons = {
      Package,
      Headphones,
      BookOpen,
      MessageSquare,
      Users,
      AlertCircle,
    }
    const IconComponent = icons[iconName as keyof typeof icons] || Package
    return <IconComponent className="h-5 w-5" />
  }

  const actions = [
    {
      title: "Crear Ticket",
      description: "Reportar problema técnico",
      href: "/tickets",
      icon: "Headphones",
      color: "text-orange-600 hover:bg-orange-50",
      roles: ["empleado", "admin"],
      action: "create",
    },
    {
      title: "Ver Productos",
      description: "Consultar catálogo",
      href: "/products",
      icon: "Package",
      color: "text-blue-600 hover:bg-blue-50",
      roles: ["empleado", "admin"],
      action: "view",
    },
    {
      title: "Base Conocimientos",
      description: "Buscar soluciones",
      href: "/knowledge",
      icon: "BookOpen",
      color: "text-green-600 hover:bg-green-50",
      roles: ["empleado", "admin"],
      action: "search",
    },
    {
      title: "Comunicaciones",
      description: "Ver novedades",
      href: "/communications",
      icon: "MessageSquare",
      color: "text-purple-600 hover:bg-purple-50",
      roles: ["empleado", "admin"],
      action: "view",
    },
    {
      title: "Gestionar Usuarios",
      description: "Administrar personal",
      href: "/users",
      icon: "Users",
      color: "text-indigo-600 hover:bg-indigo-50",
      roles: ["admin"],
      action: "manage",
    },
    {
      title: "Tickets Pendientes",
      description: "Resolver incidencias",
      href: "/tickets",
      icon: "AlertCircle",
      color: "text-red-600 hover:bg-red-50",
      roles: ["empleado", "admin"],
      action: "manage",
    },
  ]

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-3 w-3" />
      case "search":
        return <Search className="h-3 w-3" />
      case "manage":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <ArrowRight className="h-3 w-3" />
    }
  }

  const filteredActions = actions.filter((action) => action.roles.includes(userRole))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accesos Rápidos</CardTitle>
        <CardDescription>Funciones más utilizadas según tu rol</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className={`w-full h-auto p-4 justify-start ${action.color} border-border hover:border-current transition-colors`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">{getIcon(action.icon)}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                  <div className="flex-shrink-0">{getActionIcon(action.action)}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
