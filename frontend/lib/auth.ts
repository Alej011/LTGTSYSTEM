import { apiClient, saveToken, removeToken, ApiClientError } from "./api-client"
import { API_ENDPOINTS } from "./api-config"

/**
 * Roles del frontend
 * - admin: Acceso completo (incluye gestión de usuarios)
 * - empleado: Acceso limitado (sin gestión de usuarios)
 */
export type UserRole = "admin" | "empleado"

/**
 * Roles del backend (API)
 */
export type BackendRole = "ADMIN" | "SUPPORT"

/**
 * Usuario autenticado en el frontend
 */
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  createdAt: Date
  lastLogin?: Date
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Respuesta del backend al hacer login
 */
interface LoginResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
    role: BackendRole
    createdAt: string
  }
}

/**
 * Respuesta del backend al obtener el usuario actual
 */
interface MeResponse {
  id: string
  email: string
  name: string
  role: BackendRole
  createdAt: string
}

/**
 * Mapea los roles del backend a roles del frontend
 * ADMIN → admin (acceso completo)
 * SUPPORT → empleado (acceso limitado)
 */
export function mapBackendRoleToFrontend(backendRole: BackendRole): UserRole {
  return backendRole === "ADMIN" ? "admin" : "empleado"
}

/**
 * Mapea la respuesta del backend a un objeto User del frontend
 */
function mapBackendUserToFrontend(backendUser: LoginResponse["user"] | MeResponse): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: mapBackendRoleToFrontend(backendUser.role),
    department: backendUser.role === "ADMIN" ? "Administración" : "Soporte Técnico",
    createdAt: new Date(backendUser.createdAt),
    lastLogin: new Date(),
  }
}

/**
 * Autentica un usuario con email y password
 * Guarda el token JWT en localStorage si tiene éxito
 */
export const authenticate = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      { email, password },
      { requiresAuth: false }
    )

    // Guardar token JWT en localStorage
    saveToken(response.accessToken)

    // Mapear y retornar usuario del frontend
    return mapBackendUserToFrontend(response.user)
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Login failed:", error.message)
    }
    return null
  }
}

/**
 * Obtiene el usuario actual desde el backend
 * Usa el token JWT guardado en localStorage
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<MeResponse>(API_ENDPOINTS.auth.me)
    return mapBackendUserToFrontend(response)
  } catch (error) {
    if (error instanceof ApiClientError) {
      // Si el token es inválido o expiró, limpiar localStorage
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
