/**
 * Authentication and User schemas with Zod validation
 */
import { z } from "zod"
import { EmailSchema, PasswordSchema, DateStringSchema, UUIDSchema } from "./common.schema"

/**
 * Backend role enum (as received from API)
 */
export const BackendRoleSchema = z.enum(["ADMIN", "SUPPORT", "admin", "support", "Admin", "Support"])
export type BackendRole = z.infer<typeof BackendRoleSchema>

/**
 * Frontend role enum (internal representation)
 */
export const FrontendRoleSchema = z.enum(["admin", "empleado"])
export type FrontendRole = z.infer<typeof FrontendRoleSchema>

/**
 * Role mapper function - case insensitive
 */
export function mapBackendRoleToFrontend(backendRole: BackendRole): FrontendRole {
  // Normalize to uppercase for mapping
  const normalizedRole = backendRole.toUpperCase()

  const roleMap: Record<string, FrontendRole> = {
    ADMIN: "admin",
    SUPPORT: "empleado",
  }

  return roleMap[normalizedRole] || "empleado" // Default to empleado if unknown
}

/**
 * User schema (frontend representation)
 */
export const UserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  name: z.string().min(1, "El nombre es requerido"),
  role: FrontendRoleSchema,
  department: z.string().optional(),
  createdAt: DateStringSchema.optional(),
  lastLogin: DateStringSchema.optional(),
})

export type User = z.infer<typeof UserSchema>

/**
 * Backend user response schema (as received from API)
 */
export const BackendUserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  name: z.string(),
  role: BackendRoleSchema,
  department: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  lastLogin: z.string().optional().nullable(),
})

export type BackendUser = z.infer<typeof BackendUserSchema>

/**
 * Transform backend user to frontend user
 */
export function mapBackendUserToFrontend(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: mapBackendRoleToFrontend(backendUser.role),
    department: backendUser.department || undefined,
    createdAt: backendUser.createdAt || undefined, // Keep as ISO string from backend
    lastLogin: backendUser.lastLogin || undefined, // Keep as ISO string from backend
  }
}

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

/**
 * Login response schema (from backend)
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1, "Token inválido"),
  user: BackendUserSchema,
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>

/**
 * Frontend login result (after transformation)
 */
export const LoginResultSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
})

export type LoginResult = z.infer<typeof LoginResultSchema>

/**
 * Current user response (GET /api/auth/me)
 */
export const CurrentUserResponseSchema = BackendUserSchema

export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>

/**
 * Register request schema (for future use)
 */
export const RegisterRequestSchema = z.object({
  email: EmailSchema,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
