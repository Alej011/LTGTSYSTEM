import { apiClient, saveToken, removeToken, ApiClientError } from "@/lib/shared/api-client"
import { LoginResultSchema, UserSchema } from "@/lib/schemas/auth.schema"

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
 * Autentica un usuario con email y password
 * Guarda el token JWT en localStorage si tiene éxito
 * Ahora llama al BFF (/api/auth/login) en lugar del backend directamente
 */
export const authenticate = async (email: string, password: string): Promise<User | null> => {
  try {
    // Call BFF endpoint - NO schema validation here, BFF already validated
    const response = await apiClient.post<any>(
      "/api/auth/login", // BFF endpoint (same domain)
      { email, password },
      {
        requiresAuth: false,
        // Don't validate here - BFF already validated and transformed
      }
    )

    if (process.env.NODE_ENV === "development") {
      console.log("[authenticate] FULL BFF Response:", JSON.stringify(response, null, 2))
      console.log("[authenticate] Response user:", response.user)
      console.log("[authenticate] Response user role:", response.user.role)
      console.log("[authenticate] Response user role TYPE:", typeof response.user.role)
    }

    // Guardar token JWT en localStorage y cookies
    saveToken(response.accessToken)

    // BFF already transformed role and dates, so we can trust the response
    const user: User = {
      ...response.user,
      role: response.user.role as UserRole,
      // Keep dates as ISO strings from BFF
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[authenticate] Final user:", user)
      console.log("[authenticate] Final user role:", user.role)
    }

    return user
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Login failed:", error.message)
    }
    return null
  }
}

/**
 * Obtiene el usuario actual desde el BFF
 * Usa el token JWT guardado en localStorage
 * Ahora llama al BFF (/api/auth/me) en lugar del backend directamente
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Call BFF endpoint - NO schema validation here, BFF already validated
    const response = await apiClient.get<any>(
      "/api/auth/me", // BFF endpoint (same domain)
      {
        // Don't validate here - BFF already validated and transformed
      }
    )

    if (process.env.NODE_ENV === "development") {
      console.log("[getCurrentUser] FULL BFF Response:", JSON.stringify(response, null, 2))
      console.log("[getCurrentUser] Response role:", response.role)
      console.log("[getCurrentUser] Response role TYPE:", typeof response.role)
    }

    // BFF already transformed role and dates, so we can trust the response
    const user: User = {
      ...response,
      role: response.role as UserRole,
      // Keep dates as ISO strings from BFF
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[getCurrentUser] Final user:", user)
      console.log("[getCurrentUser] Final user role:", user.role)
    }

    return user
  } catch (error) {
    if (error instanceof ApiClientError) {
      // Si el token es inválido o expiró, limpiar localStorage y cookies
      if (error.statusCode === 401) {
        removeToken()
      }
      console.error("Get current user failed:", error.message)
    }
    return null
  }
}

/**
 * Cierra la sesión del usuario
 * Elimina el token del localStorage
 */
export const logout = (): void => {
  removeToken()
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
