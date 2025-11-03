"use client"

/**
 * Auth Context refactored with React Query
 * Much simpler - delegates all state management to React Query
 */
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type User } from "@/lib/auth"
import { useCurrentUser, useLogin as useLoginMutation, useLogout as useLogoutMutation } from "@/lib/queries/auth.queries"
import { STORAGE_KEYS } from "@/lib/api-config"

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

  // State to track if token exists (avoid hydration issues)
  const [hasToken, setHasToken] = useState(false)

  // Check for token only on client side (after hydration)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      setHasToken(!!token)
    }
  }, [])

  // Use React Query hook for current user
  const { data: user, isLoading, error } = useCurrentUser({
    enabled: hasToken, // Only fetch if token exists
  })

  // Login mutation
  const loginMutation = useLoginMutation()

  // Logout mutation
  const logoutMutation = useLogoutMutation()

  // Derived state
  const isAuthenticated = !!user

  // Login function wrapper
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password })
      setHasToken(true) // Update token state after successful login
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  // Logout function wrapper
  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setHasToken(false) // Clear token state after logout
        router.push("/") // Redirect to login
      },
    })
  }

  // Handle authentication errors (e.g., invalid token)
  useEffect(() => {
    if (error && hasToken) {
      // Token is invalid, clear it
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      }
      setHasToken(false)
    }
  }, [error, hasToken])

  const value: AuthContextType = {
    user: user ?? null,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 * Now powered by React Query - no manual state management!
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
