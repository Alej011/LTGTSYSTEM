/**
 * Common Zod schemas shared across the application
 */
import { z } from 'zod';

/**
 * Pagination metadata (matches backend response exactly)
 */
export const PaginationMetadataSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasPrevPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export type PaginationMetadata = z.infer<typeof PaginationMetadataSchema>;

/**
 * Date string that transforms to Date object
 * Accepts ISO strings, date strings
 */
export const DateStringSchema = z.string();

/**
 * ID validation - accepts any non-empty string (UUID, CUID, etc.)
 */
export const UUIDSchema = z.string().min(1);

/**
 * Email validation
 */
export const EmailSchema = z.email('Email inválido');

/**
 * Password validation (min 6 characters)
 */
export const PasswordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');
