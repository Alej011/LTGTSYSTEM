"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  getTickets,
  getPriorityColor,
  getStatusColor,
  getCategoryLabel,
} from "@/lib/tickets"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission } from "@/lib/auth"
import { Search, Plus, Eye, Headphones, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface TicketListProps {
  onView: (ticket: Ticket) => void
  onAdd: () => void
}

export function TicketList({ onView, onAdd }: TicketListProps) {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assignmentFilter, setAssignmentFilter] = useState("all")

  useEffect(() => {
    loadTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchTerm, statusFilter, priorityFilter, assignmentFilter, user])

  const loadTickets = () => {
    const ticketsData = getTickets()
    setTickets(ticketsData)
  }

  const filterTickets = () => {
    if (!user) return

    let filtered = tickets

    // Filter by user role and permissions
    if (user.role === "empleado") {
      // Support employees can see all tickets with special filters
      if (assignmentFilter === "mine") {
        filtered = filtered.filter((ticket) => ticket.assignedTo === user.id || ticket.createdBy === user.id)
      } else if (assignmentFilter === "unassigned") {
        filtered = filtered.filter((ticket) => !ticket.assignedTo)
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.createdByName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter)
    }

    setFilteredTickets(filtered)
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    return (
      <Badge variant="outline" className={getPriorityColor(priority)}>
        <span className="capitalize">{priority}</span>
      </Badge>
    )
  }

  const getStatusBadge = (status: TicketStatus) => {
    const labels = {
      abierto: "Abierto",
      en_progreso: "En Progreso",
      resuelto: "Resuelto",
      cerrado: "Cerrado",
    }

    return (
      <Badge variant="outline" className={getStatusColor(status)}>
        {labels[status]}
      </Badge>
    )
  }

  const canCreateTickets = hasPermission(user?.role || "empleado", "tickets")
  const canManageTickets = user?.role === "empleado" || user?.role === "admin"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Tickets de Soporte
              </CardTitle>
              <CardDescription>
                {user?.role === "empleado"
                  ? "Gestiona tus solicitudes de soporte técnico"
                  : "Administra y da seguimiento a los tickets de soporte"}
              </CardDescription>
            </div>
            {canCreateTickets && (
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Ticket
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="abierto">Abierto</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
              {canManageTickets && (
                <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Asignación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="mine">Mis tickets</SelectItem>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  {canManageTickets && <TableHead>Asignado a</TableHead>}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageTickets ? 8 : 7} className="text-center py-8 text-muted-foreground">
                      No se encontraron tickets
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onView(ticket)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-sm text-muted-foreground">#{ticket.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.createdByName}</TableCell>
                      <TableCell>{getCategoryLabel(ticket.category)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(ticket.createdAt, { addSuffix: true, locale: es })}
                        </div>
                      </TableCell>
                      {canManageTickets && (
                        <TableCell>
                          {ticket.assignedToName || <span className="text-muted-foreground">Sin asignar</span>}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(ticket)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
