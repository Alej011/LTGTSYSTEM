/**
 * Schemas Zod del dominio de productos, cada uno atado a su tipo del contrato:
 * las respuestas que valida el BFF y el formulario que valida el navegador antes de enviar.
 */
import { z } from 'zod';

import { type ApiSchemas, matchesContract } from '@/shared/api/contract';

export const PaginationMetadataSchema = matchesContract<ApiSchemas['PaginationMetadata']>()(
  z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasPrevPage: z.boolean(),
    hasNextPage: z.boolean(),
  }),
);

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

// Mismas reglas que CreateProductDto, con mensajes para el usuario; el backend no debería rechazar lo que pasa aquí
export const ProductFormSchema = matchesContract<ApiSchemas['CreateProductDto']>()(
  z.object({
    name: z.string().trim().min(1, 'Ingresa el nombre del producto'),
    description: z.string().optional(),
    sku: z.string().trim().min(1, 'Ingresa el SKU'),
    price: z
      .number('Ingresa el precio')
      .nonnegative('El precio no puede ser negativo')
      .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, 'El precio admite hasta 2 decimales'),
    stock: z
      .number('Ingresa el stock')
      .int('El stock debe ser un número entero')
      .nonnegative('El stock no puede ser negativo'),
    status: ProductStatusSchema.optional(),
    brandId: z.string().min(1, 'Selecciona una marca'),
    categoryIds: z.array(z.string().min(1, 'Selecciona una categoría')).min(1, 'Selecciona una categoría'),
  }),
);

export const BrandsResponseSchema = z.array(BrandSchema);

export const CategoriesResponseSchema = z.array(CategorySchema);
