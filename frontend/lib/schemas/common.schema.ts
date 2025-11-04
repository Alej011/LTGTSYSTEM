/**
 * Common Zod schemas shared across the application
 */
import { z } from "zod"

/**
 * API Response wrapper
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number().optional(),
  })

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
})

export type PaginationMetadata = z.infer<typeof PaginationMetadataSchema>

/**
 * Paginated response wrapper
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: PaginationMetadataSchema,
  })

/**
 * Common error response
 */
export const ErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number(),
  field: z.string().optional(), // For validation errors
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * Date string that transforms to Date object
 * Accepts ISO strings, date strings
 */
export const DateStringSchema = z.string()

/**
 * ID validation - accepts any non-empty string (UUID, CUID, etc.)
 */
export const UUIDSchema = z.string().min(1)

/**
 * Email validation
 */
export const EmailSchema = z.string().email("Email inválido")

/**
 * Password validation (min 6 characters)
 */
export const PasswordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
