"use client"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  // Solo mostrar spinner en la carga inicial (restaurando sesión)
  // No durante el login (para no desmontar el LoginForm)
  if (isLoading && !isAuthenticated) {
    // Verificar si realmente estamos validando sesión inicial
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('access_token')
    if (hasToken) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return <LoginForm />
}
