"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type TicketCategory, type TicketPriority, createTicket, getCategoryLabel } from "@/lib/tickets"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Headphones } from "lucide-react"

interface TicketFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function TicketForm({ onSuccess, onCancel }: TicketFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as TicketCategory,
    priority: "media" as TicketPriority,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setIsLoading(true)

    try {
      await createTicket({
        ...formData,
        createdBy: user.id,
        createdByName: user.name,
      })
      onSuccess()
    } catch (err) {
      setError("Error al crear el ticket. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const categories: TicketCategory[] = ["hardware", "software", "red", "acceso", "otro"]
  const priorities: TicketPriority[] = ["baja", "media", "alta", "critica"]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          Nuevo Ticket de Soporte
        </CardTitle>
        <CardDescription>
          Describe tu problema o solicitud de soporte técnico. Nuestro equipo te ayudará lo antes posible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Problema</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ej: No puedo acceder al sistema de correo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Detallada</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe el problema con el mayor detalle posible. Incluye pasos para reproducir el error, mensajes de error, etc."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <span className="capitalize">{priority}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información del Solicitante</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Nombre:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Departamento:</strong> {user?.department}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.category}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Ticket...
                </>
              ) : (
                "Crear Ticket"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
