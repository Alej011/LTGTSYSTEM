import type { UserRole } from "./auth"

/**
 * Permisos para el módulo de productos
 */
export const productPermissions = {
  /**
   * Puede ver la lista de productos
   */
  canView: (role: UserRole): boolean => {
    return role === "admin" || role === "empleado"
  },

  /**
   * Puede ver detalles de productos
   */
  canViewDetails: (role: UserRole): boolean => {
    return role === "admin" || role === "empleado"
  },

  /**
   * Puede crear productos
   */
  canCreate: (role: UserRole): boolean => {
    return role === "admin"
  },

  /**
   * Puede editar productos
   */
  canEdit: (role: UserRole): boolean => {
    return role === "admin"
  },

  /**
   * Puede eliminar productos
   */
  canDelete: (role: UserRole): boolean => {
    return role === "admin"
  },
}

/**
 * Hook helper para verificar permisos de productos
 */
export function useProductPermissions(role: UserRole | undefined) {
  if (!role) {
    return {
      canView: false,
      canViewDetails: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    }
  }

  return {
    canView: productPermissions.canView(role),
    canViewDetails: productPermissions.canViewDetails(role),
    canCreate: productPermissions.canCreate(role),
    canEdit: productPermissions.canEdit(role),
    canDelete: productPermissions.canDelete(role),
  }
}

/**
 * Permisos para el módulo de usuarios
 */
export const userPermissions = {
  /**
   * Puede ver la lista de usuarios
   */
  canView: (role: UserRole): boolean => {
    return role === "admin"
  },

  /**
   * Puede crear usuarios
   */
  canCreate: (role: UserRole): boolean => {
    return role === "admin"
  },

  /**
   * Puede editar usuarios
   */
  canEdit: (role: UserRole): boolean => {
    return role === "admin"
  },
}

/**
 * Hook helper para verificar permisos de usuarios
 */
export function useUserPermissions(role: UserRole | undefined) {
  if (!role) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
    }
  }

  return {
    canView: userPermissions.canView(role),
    canCreate: userPermissions.canCreate(role),
    canEdit: userPermissions.canEdit(role),
  }
}
