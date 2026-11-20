/**
 * User schemas with Zod validation
 */
import { z } from 'zod';

import { BackendRoleSchema, FrontendRoleSchema, mapBackendRoleToFrontend } from '@/lib/schemas/auth.schema';
import { EmailSchema, PasswordSchema, UUIDSchema } from '@/lib/schemas/common.schema';
import { type ApiSchemas, matchesContract } from '@/lib/shared/contract';

/** Usuario como lo devuelve el backend en /users */
export const BackendUserListItemSchema = matchesContract<ApiSchemas['UserDto']>()(
  z.object({
    id: UUIDSchema,
    email: EmailSchema,
    name: z.string().min(1),
    role: BackendRoleSchema,
  }),
);

export type BackendUserListItem = z.infer<typeof BackendUserListItemSchema>;

/**
 * Frontend user representation (for display)
 */
export const UserListItemSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  role: FrontendRoleSchema, // admin or empleado
});

export type UserListItem = z.infer<typeof UserListItemSchema>;

/**
 * Users list response schema (array, no pagination)
 */
export const UsersListResponseSchema = z.array(BackendUserListItemSchema);

/**
 * Transform backend user to frontend user
 */
export function mapBackendUserListItemToFrontend(backendUser: BackendUserListItem): UserListItem {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: mapBackendRoleToFrontend(backendUser.role),
  };
}

/**
 * Create user request schema
 */
export const CreateUserRequestSchema = z.object({
  email: EmailSchema,
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  password: PasswordSchema,
  role: BackendRoleSchema, // ADMIN or SUPPORT
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

/**
 * Update user request schema (all fields optional)
 */
export const UpdateUserRequestSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  role: BackendRoleSchema.optional(), // ADMIN or SUPPORT
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
