"use client"
import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { LoginRequestSchema } from "@/lib/schemas/auth.schema"
import { ApiClientError } from "@/lib/shared/api-client"
import { Building2, Loader2, Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})
  const { login, isLoading } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setValidationErrors({})

    // Client-side validation with Zod
    const validation = LoginRequestSchema.safeParse({ email, password })

    if (!validation.success) {
      const errors: { email?: string; password?: string } = {}
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") {
          errors.email = err.message
        } else if (err.path[0] === "password") {
          errors.password = err.message
        }
      })
      setValidationErrors(errors)
      return
    }

    // Attempt login
    try {
      const success = await login(email, password)
      if (success) {
        // Redirect to dashboard or original destination
        router.push(redirectTo)
      } else {
        setError("Credenciales inválidas. Por favor intente nuevamente.")
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.getUserMessage())
      } else {
        setError("Error inesperado. Por favor intente nuevamente.")
      }
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
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ltgt.com"
                className={validationErrors.email ? "border-destructive" : ""}
                required
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>

            {/* Password con botón de mostrar/ocultar */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${validationErrors.password ? "border-destructive" : ""} pr-10`}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {validationErrors.password && (
                <p className="text-sm text-destructive">{validationErrors.password}</p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botón submit */}
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
        </CardContent>
      </Card>
    </div>
  )
}
