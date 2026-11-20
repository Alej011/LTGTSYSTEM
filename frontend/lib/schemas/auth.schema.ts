/**
 * Authentication and User schemas with Zod validation
 */
import { z } from 'zod';

import { type ApiSchemas, matchesContract } from '@/shared/api/contract';
import { ROLES } from '@/shared/roles';

import { DateStringSchema, EmailSchema, PasswordSchema, UUIDSchema } from './common.schema';

/** Roles del backend; el frontend usa el mismo vocabulario */
export const RoleSchema = z.enum(ROLES);

/**
 * User schema (frontend representation)
 */
export const UserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  name: z.string().min(1, 'El nombre es requerido'),
  role: RoleSchema,
  department: z.string().optional(),
  createdAt: DateStringSchema.optional(),
  lastLogin: DateStringSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;

/** Usuario de la sesión como lo devuelve el backend en /auth/me */
export const BackendUserSchema = matchesContract<ApiSchemas['CurrentUserDto']>()(
  z.object({
    id: UUIDSchema,
    email: EmailSchema,
    name: z.string(),
    role: RoleSchema,
    createdAt: z.string(),
  }),
);

/** Convierte el usuario del backend al del frontend. El login lo trae sin createdAt; /auth/me lo incluye. */
export function mapBackendUserToFrontend(backendUser: ApiSchemas['UserDto'] & { createdAt?: string }): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: backendUser.role,
    createdAt: backendUser.createdAt,
  };
}

/** Validación del formulario de login con las mismas reglas que LoginDto */
export const LoginRequestSchema = matchesContract<ApiSchemas['LoginDto']>()(
  z.object({
    email: EmailSchema,
    password: PasswordSchema,
  }),
);

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Current user response (GET /api/auth/me)
 */
export const CurrentUserResponseSchema = BackendUserSchema;
