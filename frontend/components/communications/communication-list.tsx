"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type Communication,
  type CommunicationType,
  getCommunications,
  getAllCommunications,
  getTypeLabel,
  getTypeColor,
  isRead,
  markAsRead,
} from "@/lib/communications"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { Search, Plus, Eye, Edit, MessageSquare, Pin, Clock, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface CommunicationListProps {
  onView: (communication: Communication) => void
  onEdit?: (communication: Communication) => void
  onAdd?: () => void
  showManagement?: boolean
}

export function CommunicationList({ onView, onEdit, onAdd, showManagement = false }: CommunicationListProps) {
  const { user } = useAuth()
  const [communications, setCommunications] = useState<Communication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<CommunicationType | "all">("all")

  useEffect(() => {
    loadCommunications()
  }, [searchTerm, typeFilter, showManagement, user])

  const loadCommunications = () => {
    if (!user) return

    let filtered: Communication[]

    if (showManagement) {
      // Show all communications for management
      filtered = getAllCommunications()
    } else {
      // Show only relevant communications for the user
      filtered = getCommunications(user.id, user.role, user.department || "")
    }

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(
        (comm) =>
          comm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comm.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((comm) => comm.type === typeFilter)
    }

    setCommunications(filtered)
  }

  const handleView = async (communication: Communication) => {
    if (user && !showManagement) {
      await markAsRead(communication.id, user.id)
    }
    onView(communication)
  }

  const getTypeBadge = (type: CommunicationType) => {
    return (
      <Badge variant="outline" className={getTypeColor(type)}>
        {getTypeLabel(type)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    } as const

    const labels = {
      draft: "Borrador",
      published: "Publicado",
      archived: "Archivado",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const types: CommunicationType[] = ["anuncio", "politica", "evento", "urgente", "general"]
  const canManageCommunications =
    hasPermission(user?.role || "empleado", "communications") && user?.role === "admin"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {showManagement ? "Gestión de Comunicaciones" : "Comunicaciones Internas"}
              </CardTitle>
              <CardDescription>
                {showManagement
                  ? "Administra las comunicaciones internas de la empresa"
                  : "Mantente informado sobre novedades y directrices de la empresa"}
              </CardDescription>
            </div>
            {canManageCommunications && onAdd && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Comunicación
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar comunicaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CommunicationType | "all")}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {communications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron comunicaciones</p>
              </div>
            ) : (
              communications.map((communication) => {
                const isUnread = user && !showManagement && !isRead(communication.id, user.id)
                return (
                  <Card
                    key={communication.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      isUnread ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleView(communication)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {communication.isPinned && <Pin className="h-4 w-4 text-primary" />}
                            <h3 className="text-lg font-semibold line-clamp-1">{communication.title}</h3>
                            {isUnread && <Badge variant="default">Nuevo</Badge>}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            {getTypeBadge(communication.type)}
                            {showManagement && getStatusBadge(communication.status)}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {communication.targetDepartments.join(", ")}
                            </div>
                          </div>

                          <p className="text-muted-foreground line-clamp-2 mb-3">
                            {communication.content.substring(0, 200)}...
                          </p>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span>Por {communication.authorName}</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(communication.publishedAt || communication.createdAt, {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </div>
                            </div>
                            {communication.expiresAt && (
                              <span className="text-orange-600">
                                Expira: {formatDistanceToNow(communication.expiresAt, { addSuffix: true, locale: es })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleView(communication)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {showManagement && onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(communication)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
