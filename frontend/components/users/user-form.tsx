"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type User, createUser, updateUser } from "@/lib/features/users/users.service"
import { Loader2, ArrowLeft } from "lucide-react"

interface UserFormProps {
  user?: User
  onSuccess: () => void
  onCancel: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role === "admin" ? "ADMIN" : "SUPPORT",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (user) {
        // EDITAR: Solo nombre y rol
        await updateUser(user.id, {
          name: formData.name,
          role: formData.role as "ADMIN" | "SUPPORT",
        })
      } else {
        // CREAR: Validar que tenga contraseña
        if (!formData.password || formData.password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres")
          setIsLoading(false)
          return
        }

        await createUser({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role as "ADMIN" | "SUPPORT",
        })
      }
      onSuccess()
    } catch (err: any) {
      const errorMessage = err?.message || "Error al guardar el usuario. Intente nuevamente."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
        <CardDescription>
          {user ? "Modifica la información del usuario" : "Registra un nuevo usuario en el sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="usuario@ltgt.local"
                required
                disabled={!!user}
              />
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="SUPPORT">Soporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : user ? (
                "Actualizar"
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
