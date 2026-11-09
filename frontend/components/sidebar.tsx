"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BookOpen,
  Building2,
  Headphones,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  Users,
} from "lucide-react"
import { cn } from "@/lib/shared/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/features/auth/auth.service"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: null },
  { name: "Productos", href: "/products", icon: Package, permission: "products" },
  { name: "Soporte Técnico", href: "/tickets", icon: Headphones, permission: "tickets" },
  { name: "Base de Conocimientos", href: "/knowledge", icon: BookOpen, permission: "knowledge" },
  { name: "Comunicaciones", href: "/communications", icon: MessageSquare, permission: "communications" },
  { name: "Usuarios", href: "/users", icon: Users, permission: "users" },
]

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
]

const ROLE_LABELS: Record<string, string> = { admin: "Administrador", empleado: "Soporte" }

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

// Con el sidebar cerrado solo se ven los íconos: el nombre aparece al pasar el cursor
function WithTooltip({ label, show, children }: { label: string; show: boolean; children: ReactNode }) {
  if (!show) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

interface SidebarProps {
  collapsed?: boolean
  // Sin onToggle (menú móvil) no se muestra el botón de abrir/cerrar
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  // El tema guardado solo se conoce en el cliente; evita un desajuste de hidratación
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!user) return null

  const items = navigation.filter((item) => !item.permission || hasPermission(user.role, item.permission))
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center" : "gap-2 px-4")}>
        {!collapsed && (
          <>
            <Building2 className="h-7 w-7 shrink-0 text-sidebar-primary" />
            <span className="flex-1 truncate text-lg font-semibold tracking-tight">LTGT S.A.</span>
          </>
        )}
        {onToggle && (
          <WithTooltip label="Abrir menú (Ctrl+B)" show={collapsed}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label={collapsed ? "Abrir menú lateral" : "Cerrar menú lateral"}
              aria-expanded={!collapsed}
              title={collapsed ? undefined : "Cerrar menú (Ctrl+B)"}
              className="shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ToggleIcon className="h-5 w-5" />
            </Button>
          </WithTooltip>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")} aria-label="Secciones">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <WithTooltip key={item.href} label={item.name} show={collapsed}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  collapsed ? "justify-center px-0" : "gap-3 px-3",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            </WithTooltip>
          )
        })}
      </nav>

      <div className={cn("space-y-1 border-t border-sidebar-border", collapsed ? "p-2" : "p-3")}>
        {collapsed ? (
          <WithTooltip label={`${user.name} · ${ROLE_LABELS[user.role] ?? user.role}`} show>
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
              {initials(user.name)}
            </div>
          </WithTooltip>
        ) : (
          <div className="mb-2 px-3 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
        )}

        <DropdownMenu>
          <WithTooltip label="Configuración" show={collapsed}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                aria-label="Configuración"
                className={cn(
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed ? "mx-auto flex" : "w-full justify-start",
                )}
              >
                <Settings className="h-4 w-4" />
                {!collapsed && "Configuración"}
              </Button>
            </DropdownMenuTrigger>
          </WithTooltip>
          <DropdownMenuContent side={collapsed ? "right" : "top"} align={collapsed ? "end" : "start"} className="w-56">
            <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={mounted ? theme : undefined} onValueChange={setTheme}>
              {THEME_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <WithTooltip label="Cerrar sesión" show={collapsed}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            aria-label="Cerrar sesión"
            className={cn(
              "hover:bg-destructive/10 hover:text-destructive",
              collapsed ? "mx-auto flex" : "w-full justify-start",
            )}
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Cerrar sesión"}
          </Button>
        </WithTooltip>
      </div>
    </div>
  )
}
