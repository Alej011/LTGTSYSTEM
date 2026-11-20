/**
 * Schemas Zod de usuarios, atados al contrato: las respuestas que valida el BFF y los formularios.
 */
import { z } from 'zod';

import { type ApiSchemas, matchesContract } from '@/shared/api/contract';
import { EmailSchema, IdSchema, PasswordSchema, RoleSchema } from '@/shared/schemas';

/** Usuario como lo devuelve el backend en /users */
export const UserSchema = matchesContract<ApiSchemas['UserDto']>()(
  z.object({
    id: IdSchema,
    email: EmailSchema,
    name: z.string().min(1),
    role: RoleSchema,
  }),
);

/** Lista de usuarios (sin paginación) */
export const UsersListResponseSchema = z.array(UserSchema);

// Mismas reglas que CreateUserDto, con mensajes para el usuario; editar solo cambia nombre y rol
export const NewUserFormSchema = matchesContract<ApiSchemas['CreateUserDto']>()(
  z.object({
    email: EmailSchema,
    name: z.string().trim().min(1, 'Ingresa el nombre'),
    password: PasswordSchema,
    role: RoleSchema,
  }),
);

export const UserChangesFormSchema = NewUserFormSchema.pick({ name: true, role: true });
