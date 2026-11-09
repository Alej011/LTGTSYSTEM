import { apiClient, ApiClientError } from "@/lib/shared/api-client"

/**
 * Re-export types from schemas for convenience
 */
export type {
  User,
  FrontendRole as UserRole,
  BackendRole,
  LoginRequest,
  LoginResult,
} from "@/lib/schemas/auth.schema"

export { mapBackendRoleToFrontend, mapBackendUserToFrontend } from "@/lib/schemas/auth.schema"

// Import types for local use in this file
import type { User, FrontendRole as UserRole } from "@/lib/schemas/auth.schema"

/**
 * Estado de autenticación
 */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Inicia sesión a través del BFF. Los tokens quedan en cookies HttpOnly;
 * la respuesta solo trae el usuario ya transformado al formato del frontend.
 */
export const authenticate = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await apiClient.post<{ user: User }>("/api/auth/login", { email, password })
    return response.user
  } catch (error) {
    if (error instanceof ApiClientError) console.error("Login failed:", error.message)
    return null
  }
}

/**
 * Usuario de la sesión actual, o null si no hay sesión válida.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    return await apiClient.get<User>("/api/auth/me")
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode !== 401) {
      console.error("Get current user failed:", error.message)
    }
    return null
  }
}

/**
 * Cierra la sesión: el BFF revoca el refresh token y borra las cookies.
 */
export const logout = async (): Promise<void> => {
  await apiClient.post("/api/auth/logout")
}

export const getUserPermissions = (role: UserRole) => {
  const permissions = {
    admin: ["all"],
    empleado: ["tickets", "knowledge", "products", "communications"],
  }

  return permissions[role] || []
}

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const userPermissions = getUserPermissions(userRole)
  return userPermissions.includes("all") || userPermissions.includes(permission)
}
