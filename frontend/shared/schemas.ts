/** Schemas Zod que comparten varios dominios. */
import { z } from 'zod';

import { ROLES } from './roles';

export const RoleSchema = z.enum(ROLES);

/** Id de una entidad del backend (CUID) */
export const IdSchema = z.string().min(1);

export const EmailSchema = z.email('Email inválido');

export const PasswordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');
