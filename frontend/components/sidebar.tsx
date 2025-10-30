"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import {
  Building2,
  Package,
  Headphones,
  BookOpen,
  MessageSquare,
  Users,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: "Productos",
    href: "/products",
    icon: Package,
    permission: "products",
  },
  {
    name: "Soporte Técnico",
    href: "/tickets",
    icon: Headphones,
    permission: "tickets",
  },
  {
    name: "Base de Conocimientos",
    href: "/knowledge",
    icon: BookOpen,
    permission: "knowledge",
  },
  {
    name: "Comunicaciones",
    href: "/communications",
    icon: MessageSquare,
    permission: "communications",
  },
  {
    name: "Usuarios",
    href: "/users",
    icon: Users,
    permission: "users",
  },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const filteredNavigation = navigation.filter((item) => !item.permission || hasPermission(user.role, item.permission))

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Building2 className="h-8 w-8 text-sidebar-primary" />
        <span className="ml-2 text-lg font-semibold text-sidebar-foreground">LTGT S.A.</span>
      </div>

      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
          <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
          <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
        </div>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
