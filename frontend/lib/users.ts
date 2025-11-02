import { apiClient, ApiClientError } from "./api-client";
import { API_ENDPOINTS } from "./api-config";

// ====================================
// TIPOS Y INTERFACES
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
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>(API_ENDPOINTS.users.list);
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
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await apiClient.get<User>(API_ENDPOINTS.users.detail(id));
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
 */
export const createUser = async (userData: CreateUserData): Promise<User | null> => {
  try {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.users.create,
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
 */
export const updateUser = async (
  id: string,
  userData: UpdateUserData
): Promise<User | null> => {
  try {
    const response = await apiClient.patch<User>(
      API_ENDPOINTS.users.update(id),
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
