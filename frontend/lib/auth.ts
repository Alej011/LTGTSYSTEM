export type UserRole = "admin" | "empleado"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  createdAt: Date
  lastLogin?: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Mock user database - In production, this would be a real database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@ltgt.com",
    name: "Administrador Sistema",
    role: "admin",
    department: "Administración",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "2",
    email: "empleado1@ltgt.com",
    name: "Juan Pérez",
    role: "empleado",
    department: "Soporte Técnico",
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date(),
  },
  {
    id: "3",
    email: "empleado2@ltgt.com",
    name: "María González",
    role: "empleado",
    department: "Soporte Técnico",
    createdAt: new Date("2024-02-01"),
    lastLogin: new Date(),
  },
  {
    id: "4",
    email: "empleado3@ltgt.com",
    name: "Carlos Rodríguez",
    role: "empleado",
    department: "Soporte Técnico",
    createdAt: new Date("2024-02-10"),
    lastLogin: new Date(),
  },
]

export const authenticate = async (email: string, password: string): Promise<User | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple authentication - In production, use proper password hashing
  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "password123") {
    return { ...user, lastLogin: new Date() }
  }
  return null
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
