/**
 * Authentication and User schemas with Zod validation
 */
import { z } from 'zod';

import { ROLES } from '@/lib/shared/roles';

import { DateStringSchema, EmailSchema, PasswordSchema, UUIDSchema } from './common.schema';

/**
 * Backend role enum: same values as Prisma Role, the backend rejects any other casing
 */
export const BackendRoleSchema = z.enum(ROLES);
export type BackendRole = z.infer<typeof BackendRoleSchema>;

/**
 * Frontend role enum (internal representation)
 */
export const FrontendRoleSchema = z.enum(['admin', 'empleado']);
export type FrontendRole = z.infer<typeof FrontendRoleSchema>;

const BACKEND_TO_FRONTEND_ROLE: Record<BackendRole, FrontendRole> = {
  ADMIN: 'admin',
  SUPPORT: 'empleado',
};

export function mapBackendRoleToFrontend(backendRole: BackendRole): FrontendRole {
  return BACKEND_TO_FRONTEND_ROLE[backendRole];
}

const FRONTEND_TO_BACKEND_ROLE: Record<FrontendRole, BackendRole> = {
  admin: 'ADMIN',
  empleado: 'SUPPORT',
};

export function mapFrontendRoleToBackend(frontendRole: FrontendRole): BackendRole {
  return FRONTEND_TO_BACKEND_ROLE[frontendRole];
}

/**
 * User schema (frontend representation)
 */
export const UserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  name: z.string().min(1, 'El nombre es requerido'),
  role: FrontendRoleSchema,
  department: z.string().optional(),
  createdAt: DateStringSchema.optional(),
  lastLogin: DateStringSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;

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
});

export type BackendUser = z.infer<typeof BackendUserSchema>;

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
  };
}

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Current user response (GET /api/auth/me)
 */
export const CurrentUserResponseSchema = BackendUserSchema;
