/**
 * Product, Brand, and Category schemas with Zod validation
 */
import { z } from 'zod';

import { PaginationMetadataSchema, UUIDSchema } from '@/lib/schemas/common.schema';
import { type ApiSchemas, matchesContract } from '@/lib/shared/contract';

/**
 * Product status enum
 */
export const ProductStatusSchema = z.enum(['active', 'inactive', 'discontinued']);

/**
 * Sort options for products
 */
export const ProductSortBySchema = z.enum(['name', 'price', 'stock', 'createdAt']);

export const SortOrderSchema = z.enum(['asc', 'desc']);

// Respuestas del backend que valida el BFF; cada una está atada a su tipo del contrato

export const BrandSchema = matchesContract<ApiSchemas['BrandDto']>()(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
);

export const CategorySchema = matchesContract<ApiSchemas['CategoryDto']>()(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
);

export const ProductSchema = matchesContract<ApiSchemas['ProductResponseDto']>()(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string(),
    sku: z.string().min(1),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    status: ProductStatusSchema,
    brandId: z.string().min(1),
    brand: z.object({ id: z.string().min(1), name: z.string() }),
    categories: z.array(z.object({ id: z.string().min(1), name: z.string() })),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
);

export const PaginatedProductsSchema = matchesContract<ApiSchemas['PaginatedProductsDto']>()(
  z.object({
    data: z.array(ProductSchema),
    meta: PaginationMetadataSchema,
  }),
);

/**
 * Product filters schema
 */
export const ProductFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: ProductStatusSchema.optional(),
  brandId: UUIDSchema.optional(),
  maxStock: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: ProductSortBySchema.optional(),
  sortOrder: SortOrderSchema.optional(),
});

/**
 * Create product request schema (matches backend DTO exactly)
 */
export const CreateProductRequestSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().optional(),
  sku: z.string().min(1, 'El SKU es requerido').max(50, 'Máximo 50 caracteres'),
  price: z.number().nonnegative('El precio no puede ser negativo'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo'),
  status: ProductStatusSchema,
  brandId: z.string().min(1, 'Debe seleccionar una marca'), // CUID, not UUID
  categoryIds: z.array(z.string().min(1)).min(1, 'Debe seleccionar al menos una categoría'), // CUIDs
});

/**
 * Update product request schema (all fields optional, same as Create but partial)
 */
export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres').optional(),
  description: z.string().optional(),
  sku: z.string().min(1, 'El SKU es requerido').max(50, 'Máximo 50 caracteres').optional(),
  price: z.number().nonnegative('El precio no puede ser negativo').optional(),
  stock: z.number().int().nonnegative('El stock no puede ser negativo').optional(),
  status: ProductStatusSchema.optional(),
  brandId: z.string().min(1, 'Debe seleccionar una marca').optional(), // CUID
  categoryIds: z.array(z.string().min(1)).min(1, 'Debe seleccionar al menos una categoría').optional(), // CUIDs
});

export const BrandsResponseSchema = z.array(BrandSchema);

export const CategoriesResponseSchema = z.array(CategorySchema);
