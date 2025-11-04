"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  type Communication,
  type CommunicationType,
  type CommunicationStatus,
  createCommunication,
  updateCommunication,
  getTypeLabel,
} from "@/lib/features/communications/communications.service"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, MessageSquare, Calendar } from "lucide-react"

interface CommunicationFormProps {
  communication?: Communication
  onSuccess: () => void
  onCancel: () => void
}

export function CommunicationForm({ communication, onSuccess, onCancel }: CommunicationFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: communication?.title || "",
    content: communication?.content || "",
    type: communication?.type || ("general" as CommunicationType),
    status: communication?.status || ("draft" as CommunicationStatus),
    targetDepartments: communication?.targetDepartments || ["Todos"],
    targetRoles: communication?.targetRoles || [],
    isPinned: communication?.isPinned || false,
    expiresAt: communication?.expiresAt ? communication.expiresAt.toISOString().split("T")[0] : "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setIsLoading(true)

    try {
      const commData = {
        ...formData,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      }

      if (communication) {
        await updateCommunication(communication.id, commData)
      } else {
        await createCommunication(commData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar la comunicación. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDepartmentChange = (department: string, checked: boolean) => {
    if (department === "Todos") {
      setFormData((prev) => ({
        ...prev,
        targetDepartments: checked ? ["Todos"] : [],
      }))
    } else {
      setFormData((prev) => {
        let newDepartments = [...prev.targetDepartments]
        if (checked) {
          newDepartments = newDepartments.filter((d) => d !== "Todos")
          newDepartments.push(department)
        } else {
          newDepartments = newDepartments.filter((d) => d !== department)
        }
        return { ...prev, targetDepartments: newDepartments }
      })
    }
  }

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData((prev) => {
      let newRoles = [...prev.targetRoles]
      if (checked) {
        newRoles.push(role)
      } else {
        newRoles = newRoles.filter((r) => r !== role)
      }
      return { ...prev, targetRoles: newRoles }
    })
  }

  const types: CommunicationType[] = ["anuncio", "politica", "evento", "urgente", "general"]
  const statuses: CommunicationStatus[] = ["draft", "published", "archived"]
  const departments = ["IT", "Recursos Humanos", "Gerencia", "Ventas", "Soporte Técnico", "Administración"]
  const roles = ["empleado", "admin"]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {communication ? "Editar Comunicación" : "Nueva Comunicación"}
        </CardTitle>
        <CardDescription>
          {communication
            ? "Modifica la información de la comunicación interna"
            : "Crea una nueva comunicación para el personal"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Comunicación</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Nueva Política de Trabajo Remoto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Contenido completo de la comunicación. Puedes usar Markdown para formato..."
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Usa Markdown para dar formato (# para títulos, ## para subtítulos, etc.)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Comunicación</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">
                          {status === "draft" ? "Borrador" : status === "published" ? "Publicado" : "Archivado"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Fecha de Expiración (Opcional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => handleInputChange("expiresAt", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => handleInputChange("isPinned", checked)}
                />
                <Label htmlFor="isPinned">Fijar comunicación</Label>
              </div>

              <div className="space-y-3">
                <Label>Departamentos Objetivo</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dept-todos"
                      checked={formData.targetDepartments.includes("Todos")}
                      onCheckedChange={(checked) => handleDepartmentChange("Todos", checked as boolean)}
                    />
                    <Label htmlFor="dept-todos" className="font-medium">
                      Todos los departamentos
                    </Label>
                  </div>
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept}`}
                        checked={formData.targetDepartments.includes(dept)}
                        onCheckedChange={(checked) => handleDepartmentChange(dept, checked as boolean)}
                        disabled={formData.targetDepartments.includes("Todos")}
                      />
                      <Label htmlFor={`dept-${dept}`}>{dept}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Roles Objetivo (Opcional)</Label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={formData.targetRoles.includes(role)}
                        onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                      />
                      <Label htmlFor={`role-${role}`} className="capitalize">
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Si no seleccionas roles, la comunicación será visible para todos los roles
                </p>
              </div>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : communication ? (
                "Actualizar Comunicación"
              ) : (
                "Crear Comunicación"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
