import { apiClient, ApiClientError } from "@/lib/shared/api-client";
import { API_ENDPOINTS } from "@/lib/shared/api-config";

// Re-export types from schemas
export type {
  UserListItem,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/lib/schemas/user.schema";

// ====================================
// TIPOS Y INTERFACES (for backwards compatibility)
// ====================================

export type UserRole = "admin" | "empleado";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "SUPPORT";
}

export interface UpdateUserData {
  name?: string;
  role?: "ADMIN" | "SUPPORT";
}

// ====================================
// FUNCIONES DE API
// ====================================

/**
 * Obtiene todos los usuarios
 * Now calls BFF endpoint which validates with Zod and transforms roles
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    // Call BFF endpoint (same domain) - already validated and transformed
    const response = await apiClient.get<User[]>("/api/users/list");
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al obtener usuarios:", error.message);
    }
    return [];
  }
};

/**
 * Obtiene un usuario por ID
 * Now calls BFF endpoint which validates with Zod and transforms roles
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    // Call BFF endpoint (same domain) - already validated and transformed
    const response = await apiClient.get<User>(`/api/users/getById/${id}`);
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al obtener usuario ${id}:`, error.message);
    }
    return null;
  }
};

/**
 * Crea un nuevo usuario
 * Now calls BFF endpoint which validates with Zod and transforms roles
 */
export const createUser = async (userData: CreateUserData): Promise<User | null> => {
  try {
    // Call BFF endpoint (same domain) - already validated and transformed
    const response = await apiClient.post<User>(
      "/api/users/create",
      userData
    );
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al crear usuario:", error.message);
    }
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 * Now calls BFF endpoint which validates with Zod and transforms roles
 */
export const updateUser = async (
  id: string,
  userData: UpdateUserData
): Promise<User | null> => {
  try {
    // Call BFF endpoint (same domain) - already validated and transformed
    const response = await apiClient.patch<User>(
      `/api/users/update/${id}`,
      userData
    );
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al actualizar usuario ${id}:`, error.message);
    }
    throw error;
  }
};
