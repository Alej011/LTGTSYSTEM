"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Building2, Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  // Debug: Log cuando cambia el error
  useEffect(() => {
    console.log("Error state changed:", error)
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const success = await login(email, password)
      console.log("Login result:", success)
      if (!success) {
        const errorMsg = "Credenciales inválidas. Intente nuevamente."
        console.log("Setting error:", errorMsg)
        setError(errorMsg)
        console.log("Error set to:", errorMsg)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Error al iniciar sesión. Intente nuevamente.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">LTGT S.A.</CardTitle>
          <CardDescription>Sistema de Gestión Empresarial</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ltgt.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive" data-testid="login-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs">
              <p>• admin@ltgt.com (Administrador)</p>
              <p>• empleado1@ltgt.com (Empleado de Soporte)</p>
              <p>• empleado2@ltgt.com (Empleado de Soporte)</p>
              <p>• empleado3@ltgt.com (Empleado de Soporte)</p>
              <p className="mt-2 font-medium">Contraseña: password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
