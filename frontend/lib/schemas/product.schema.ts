/**
 * Product, Brand, and Category schemas with Zod validation
 */
import { z } from "zod"
import { UUIDSchema, DateStringSchema, PaginationMetadataSchema } from "./common.schema"

/**
 * Product status enum
 */
export const ProductStatusSchema = z.enum(["active", "inactive", "discontinued"])
export type ProductStatus = z.infer<typeof ProductStatusSchema>

/**
 * Sort options for products
 */
export const ProductSortBySchema = z.enum(["name", "price", "stock", "createdAt"])
export type ProductSortBy = z.infer<typeof ProductSortBySchema>

export const SortOrderSchema = z.enum(["asc", "desc"])
export type SortOrder = z.infer<typeof SortOrderSchema>

/**
 * Brand schema (CUIDs from backend)
 */
export const BrandSchema = z.object({
  id: z.string().min(1), // CUID
  name: z.string().min(1, "El nombre de la marca es requerido"),
  description: z.string().optional(),
  createdAt: z.string(), // ISO string from backend
  updatedAt: z.string(), // ISO string from backend
})

export type Brand = z.infer<typeof BrandSchema>

/**
 * Category schema (CUIDs from backend)
 */
export const CategorySchema = z.object({
  id: z.string().min(1), // CUID
  name: z.string().min(1, "El nombre de la categoría es requerido"),
  description: z.string().optional(),
})

export type Category = z.infer<typeof CategorySchema>

/**
 * Backend product response schema (as received from API with CUIDs)
 */
export const BackendProductSchema = z.object({
  id: z.string().min(1), // CUID from backend
  name: z.string().min(1),
  description: z.string(),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  status: ProductStatusSchema,
  brandId: z.string().min(1), // CUID
  brand: z.object({
    id: z.string().min(1), // CUID
    name: z.string(),
  }),
  categories: z.array(
    z.object({
      id: z.string().min(1), // CUID
      name: z.string(),
    })
  ),
  createdAt: z.string(), // ISO 8601 string from backend
  updatedAt: z.string(), // ISO 8601 string from backend
})

export type BackendProduct = z.infer<typeof BackendProductSchema>

/**
 * Frontend product schema (after transformation)
 */
export const ProductSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1, "El nombre del producto es requerido"),
  description: z.string(),
  sku: z.string().min(1, "El SKU es requerido"),
  price: z.number().positive("El precio debe ser positivo"),
  stock: z.number().int().nonnegative("El stock no puede ser negativo"),
  status: ProductStatusSchema,
  brandId: UUIDSchema,
  brand: BrandSchema.optional(),
  categories: z.array(CategorySchema),
  createdAt: DateStringSchema,
  updatedAt: DateStringSchema,
})

export type Product = z.infer<typeof ProductSchema>

/**
 * Transform backend product to frontend product
 */
export function mapBackendProductToFrontend(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description,
    sku: backendProduct.sku,
    price: Number(backendProduct.price),
    stock: backendProduct.stock,
    status: backendProduct.status,
    brandId: backendProduct.brandId,
    brand: {
      id: backendProduct.brand.id,
      name: backendProduct.brand.name,
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: backendProduct.categories || [],
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: new Date(backendProduct.updatedAt),
  }
}

/**
 * Paginated products response
 */
export const PaginatedProductsSchema = z.object({
  data: z.array(BackendProductSchema),
  meta: PaginationMetadataSchema,
})

export type PaginatedProducts = z.infer<typeof PaginatedProductsSchema>

/**
 * Product filters schema
 */
export const ProductFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: ProductStatusSchema.optional(),
  brandId: UUIDSchema.optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sortBy: ProductSortBySchema.optional(),
  sortOrder: SortOrderSchema.optional(),
})

export type ProductFilters = z.infer<typeof ProductFiltersSchema>

/**
 * Create product request schema (matches backend DTO exactly)
 */
export const CreateProductRequestSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  description: z.string().min(1, "La descripción es requerida"),
  sku: z.string().min(1, "El SKU es requerido").max(50, "Máximo 50 caracteres"),
  price: z.number().positive("El precio debe ser positivo"),
  stock: z.number().int().nonnegative("El stock no puede ser negativo"),
  status: ProductStatusSchema,
  brandId: z.string().min(1, "Debe seleccionar una marca"), // CUID, not UUID
  categoryIds: z.array(z.string().min(1)).min(1, "Debe seleccionar al menos una categoría"), // CUIDs
})

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>

/**
 * Update product request schema (all fields optional, same as Create but partial)
 */
export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres").optional(),
  description: z.string().min(1, "La descripción es requerida").optional(),
  sku: z.string().min(1, "El SKU es requerido").max(50, "Máximo 50 caracteres").optional(),
  price: z.number().positive("El precio debe ser positivo").optional(),
  stock: z.number().int().nonnegative("El stock no puede ser negativo").optional(),
  status: ProductStatusSchema.optional(),
  brandId: z.string().min(1, "Debe seleccionar una marca").optional(), // CUID
  categoryIds: z.array(z.string().min(1)).min(1, "Debe seleccionar al menos una categoría").optional(), // CUIDs
})

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>

/**
 * Brands list response schema
 */
export const BrandsResponseSchema = z.array(BrandSchema)

export type BrandsResponse = z.infer<typeof BrandsResponseSchema>

/**
 * Categories list response schema
 */
export const CategoriesResponseSchema = z.array(CategorySchema)

export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>
