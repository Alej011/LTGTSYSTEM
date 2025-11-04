/**
 * Enhanced Permission System
 * Centralized, type-safe permissions for role-based access control
 */
import type { UserRole } from "@/lib/features/auth/auth.service"

/**
 * Permission actions (CRUD operations)
 */
export type PermissionAction = "view" | "view_details" | "create" | "edit" | "delete"

/**
 * Resource types in the system
 */
export type ResourceType = "products" | "users" | "tickets" | "knowledge" | "communications" | "dashboard"

/**
 * Permission definition
 * Maps each resource to allowed actions per role
 */
type PermissionMatrix = {
  [K in ResourceType]: {
    [A in PermissionAction]?: UserRole[]
  }
}

/**
 * Permission matrix - Single source of truth for all permissions
 * Easy to modify and maintain
 */
const PERMISSION_MATRIX: PermissionMatrix = {
  products: {
    view: ["admin", "empleado"],
    view_details: ["admin", "empleado"],
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
  },
  users: {
    view: ["admin"],
    view_details: ["admin"],
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
  },
  tickets: {
    view: ["admin", "empleado"],
    view_details: ["admin", "empleado"],
    create: ["admin", "empleado"],
    edit: ["admin", "empleado"],
    delete: ["admin"],
  },
  knowledge: {
    view: ["admin", "empleado"],
    view_details: ["admin", "empleado"],
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
  },
  communications: {
    view: ["admin", "empleado"],
    view_details: ["admin", "empleado"],
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
  },
  dashboard: {
    view: ["admin", "empleado"],
  },
}

/**
 * Check if a role has permission for a specific action on a resource
 */
export function hasPermission(
  role: UserRole | undefined,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  if (!role) return false

  const allowedRoles = PERMISSION_MATRIX[resource]?.[action]
  if (!allowedRoles) return false

  return allowedRoles.includes(role)
}

/**
 * Get all permissions for a role on a specific resource
 */
export function getResourcePermissions(role: UserRole | undefined, resource: ResourceType) {
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
    canView: hasPermission(role, resource, "view"),
    canViewDetails: hasPermission(role, resource, "view_details"),
    canCreate: hasPermission(role, resource, "create"),
    canEdit: hasPermission(role, resource, "edit"),
    canDelete: hasPermission(role, resource, "delete"),
  }
}

/**
 * Legacy product permissions (for backward compatibility)
 * @deprecated Use getResourcePermissions("products") instead
 */
export const productPermissions = {
  canView: (role: UserRole): boolean => hasPermission(role, "products", "view"),
  canViewDetails: (role: UserRole): boolean => hasPermission(role, "products", "view_details"),
  canCreate: (role: UserRole): boolean => hasPermission(role, "products", "create"),
  canEdit: (role: UserRole): boolean => hasPermission(role, "products", "edit"),
  canDelete: (role: UserRole): boolean => hasPermission(role, "products", "delete"),
}

/**
 * Legacy user permissions (for backward compatibility)
 * @deprecated Use getResourcePermissions("users") instead
 */
export const userPermissions = {
  canView: (role: UserRole): boolean => hasPermission(role, "users", "view"),
  canCreate: (role: UserRole): boolean => hasPermission(role, "users", "create"),
  canEdit: (role: UserRole): boolean => hasPermission(role, "users", "edit"),
}

// ====================
// HOOKS
// ====================

/**
 * Hook to get permissions for a specific resource
 * Automatically uses current user's role from AuthContext
 *
 * @example
 * const permissions = usePermissions("products")
 * if (permissions.canCreate) {
 *   <CreateButton />
 * }
 */
export function usePermissions(resource: ResourceType) {
  // Note: We can't use useAuth here directly to avoid circular dependency
  // Components should pass the role or we create a wrapper
  // For now, return a function that accepts role
  return (role: UserRole | undefined) => getResourcePermissions(role, resource)
}

/**
 * Legacy hook for product permissions
 * @deprecated Use usePermissions("products")(role) instead
 */
export function useProductPermissions(role: UserRole | undefined) {
  return getResourcePermissions(role, "products")
}

/**
 * Legacy hook for user permissions
 * @deprecated Use usePermissions("users")(role) instead
 */
export function useUserPermissions(role: UserRole | undefined) {
  return getResourcePermissions(role, "users")
}

/**
 * Hook for ticket permissions
 */
export function useTicketPermissions(role: UserRole | undefined) {
  return getResourcePermissions(role, "tickets")
}

/**
 * Hook for knowledge permissions
 */
export function useKnowledgePermissions(role: UserRole | undefined) {
  return getResourcePermissions(role, "knowledge")
}

/**
 * Hook for communications permissions
 */
export function useCommunicationsPermissions(role: UserRole | undefined) {
  return getResourcePermissions(role, "communications")
}

/**
 * Hook for dashboard permissions
 */
export function useDashboardPermissions(role: UserRole | undefined) {
  return getResourcePermissions(role, "dashboard")
}
