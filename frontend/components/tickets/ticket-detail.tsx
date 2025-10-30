"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  type Ticket,
  type TicketComment,
  type TicketStatus,
  getTicketComments,
  addComment,
  updateTicket,
  getPriorityColor,
  getStatusColor,
  getCategoryLabel,
} from "@/lib/tickets"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Clock, User, MessageSquare, CheckCircle, Loader2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"

interface TicketDetailProps {
  ticket: Ticket
  onBack: () => void
  onUpdate: () => void
}

export function TicketDetail({ ticket, onBack, onUpdate }: TicketDetailProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status)
  const [solution, setSolution] = useState(ticket.solution || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadComments()
  }, [ticket.id])

  const loadComments = () => {
    const ticketComments = getTicketComments(ticket.id)
    setComments(ticketComments)
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    setIsLoading(true)
    try {
      await addComment({
        ticketId: ticket.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        comment: newComment,
        isInternal: false,
      })
      setNewComment("")
      loadComments()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTicket = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      const updateData: Partial<Ticket> = {
        status: newStatus,
      }

      // If resolving the ticket, add solution
      if (newStatus === "resuelto" && solution.trim()) {
        updateData.solution = solution
      }

      // If assigning to current user (support employee)
      if (user.role === "empleado" && !ticket.assignedTo) {
        updateData.assignedTo = user.id
        updateData.assignedToName = user.name
      }

      await updateTicket(ticket.id, updateData)
      onUpdate()
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const canManageTicket = user?.role === "empleado" || user?.role === "admin"
  const isAssignedToUser = ticket.assignedTo === user?.id
  const canUpdateStatus = canManageTicket && (isAssignedToUser || !ticket.assignedTo)

  const getPriorityBadge = () => (
    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
      <span className="capitalize">{ticket.priority}</span>
    </Badge>
  )

  const getStatusBadge = () => {
    const labels = {
      abierto: "Abierto",
      en_progreso: "En Progreso",
      resuelto: "Resuelto",
      cerrado: "Cerrado",
    }

    return (
      <Badge variant="outline" className={getStatusColor(ticket.status)}>
        {labels[ticket.status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="text-muted-foreground">Ticket #{ticket.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{ticket.description}</p>
            </CardContent>
          </Card>

          {ticket.solution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Solución
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{ticket.solution}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentarios ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No hay comentarios aún</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{comment.userName}</span>
                        <Badge variant="outline" size="sm">
                          {comment.userRole}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.comment}</p>
                  </div>
                ))
              )}

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Agregar Comentario</h4>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim() || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Agregar Comentario"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">{getStatusBadge()}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                <div className="mt-1">{getPriorityBadge()}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                <p className="mt-1">{getCategoryLabel(ticket.category)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Solicitante</label>
                <p className="mt-1">{ticket.createdByName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Asignado a</label>
                <p className="mt-1">{ticket.assignedToName || "Sin asignar"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creado</label>
                <p className="mt-1 flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(ticket.createdAt, "PPP 'a las' p", { locale: es })}
                </p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resuelto</label>
                  <p className="mt-1 flex items-center text-sm">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    {format(ticket.resolvedAt, "PPP 'a las' p", { locale: es })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {canUpdateStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Gestionar Ticket</CardTitle>
                <CardDescription>Actualiza el estado y proporciona una solución</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={newStatus} onValueChange={(value: TicketStatus) => setNewStatus(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newStatus === "resuelto" && (
                  <div>
                    <label className="text-sm font-medium">Solución</label>
                    <Textarea
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder="Describe la solución implementada..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}

                <Button onClick={handleUpdateTicket} disabled={isUpdating} className="w-full">
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar Ticket"
                  )}
                </Button>

                {!ticket.assignedTo && user?.role === "empleado" && (
                  <Alert>
                    <AlertDescription>
                      Al actualizar este ticket, se te asignará automáticamente como responsable.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
