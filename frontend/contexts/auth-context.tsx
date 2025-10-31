"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { type User, type AuthState, authenticate, getCurrentUser, logout as authLogout } from "@/lib/auth"
import { STORAGE_KEYS } from "@/lib/api-config"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: User }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }
    case "LOGIN_SUCCESS":
      return { user: action.payload, isAuthenticated: true, isLoading: false }
    case "LOGIN_FAILURE":
      return { user: null, isAuthenticated: false, isLoading: false }
    case "LOGOUT":
      return { user: null, isAuthenticated: false, isLoading: false }
    case "RESTORE_SESSION":
      return { user: action.payload, isAuthenticated: true, isLoading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Validar sesión con el backend usando el token JWT
    const validateSession = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

      if (!token) {
        dispatch({ type: "LOGIN_FAILURE" })
        return
      }

      try {
        // Validar el token obteniendo el usuario actual del backend
        const user = await getCurrentUser()
        if (user) {
          dispatch({ type: "RESTORE_SESSION", payload: user })
        } else {
          dispatch({ type: "LOGIN_FAILURE" })
        }
      } catch {
        // Si el token es inválido o expiró, limpiar sesión
        dispatch({ type: "LOGIN_FAILURE" })
      }
    }

    validateSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })

    try {
      const user = await authenticate(email, password)
      if (user) {
        // El token ya fue guardado en authenticate()
        dispatch({ type: "LOGIN_SUCCESS", payload: user })
        return true
      } else {
        dispatch({ type: "LOGIN_FAILURE" })
        return false
      }
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const logout = () => {
    // Usar la función de logout del servicio de auth para limpiar el token
    authLogout()
    dispatch({ type: "LOGOUT" })
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
