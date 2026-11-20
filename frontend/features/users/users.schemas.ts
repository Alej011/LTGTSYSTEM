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

// Mismas reglas que CreateUserDto, con mensajes para el usuario; editar solo cambia nombre y rol
export const NewUserFormSchema = matchesContract<ApiSchemas['CreateUserDto']>()(
  z.object({
    email: EmailSchema,
    name: z.string().trim().min(1, 'Ingresa el nombre'),
    password: PasswordSchema,
    role: BackendRoleSchema,
  }),
);

export const UserChangesFormSchema = NewUserFormSchema.pick({ name: true, role: true });
