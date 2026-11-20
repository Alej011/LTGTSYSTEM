/**
 * Respuestas del backend que valida el BFF; cada una está atada a su tipo del contrato.
 */
import { z } from 'zod';

import { PaginationMetadataSchema } from '@/lib/schemas/common.schema';
import { type ApiSchemas, matchesContract } from '@/lib/shared/contract';

export const ProductStatusSchema = matchesContract<ApiSchemas['ProductStatus']>()(
  z.enum(['active', 'inactive', 'discontinued']),
);

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

export const BrandsResponseSchema = z.array(BrandSchema);

export const CategoriesResponseSchema = z.array(CategorySchema);
