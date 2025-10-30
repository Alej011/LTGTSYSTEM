"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { type User, type AuthState, authenticate } from "@/lib/auth"

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
    // Restore session from localStorage
    const savedUser = localStorage.getItem("ltgt_user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: "RESTORE_SESSION", payload: user })
      } catch {
        localStorage.removeItem("ltgt_user")
        dispatch({ type: "LOGIN_FAILURE" })
      }
    } else {
      dispatch({ type: "LOGIN_FAILURE" })
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })

    try {
      const user = await authenticate(email, password)
      if (user) {
        localStorage.setItem("ltgt_user", JSON.stringify(user))
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
    localStorage.removeItem("ltgt_user")
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
