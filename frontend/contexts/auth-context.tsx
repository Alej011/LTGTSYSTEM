"use client"

/**
 * Estado de autenticación sobre React Query.
 * La sesión vive en cookies HttpOnly; el usuario actual se obtiene de /api/auth/me.
 */
import type React from "react"
import { createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { type User } from "@/lib/features/auth/auth.service"
import { useCurrentUser, useLogin as useLoginMutation, useLogout as useLogoutMutation } from "@/lib/queries/auth.queries"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: user, isLoading } = useCurrentUser()
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password })
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => router.push("/"),
    })
  }

  const value: AuthContextType = {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
