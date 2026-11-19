/**
 * Interfaz del dominio de productos para los componentes.
 * Los hooks esconden las URLs del BFF, los filtros, las query keys y la invalidación de caché.
 * Un solo modo de error: toda falla llega como ApiClientError (en `error` o en el rechazo de la mutación).
 */
import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';

import type { PaginationMetadataSchema } from '@/lib/schemas/common.schema';
import { apiClient, ApiClientError } from '@/lib/shared/api-client';

import type {
  BrandSchema,
  CategorySchema,
  CreateProductRequestSchema,
  ProductFiltersSchema,
  ProductSchema,
} from './products.schemas';

export type Product = z.infer<typeof ProductSchema>;
export type ProductStatus = Product['status'];
export type Brand = z.infer<typeof BrandSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
export type ProductInput = z.infer<typeof CreateProductRequestSchema>;
export type PaginationMetadata = z.infer<typeof PaginationMetadataSchema>;
export type ProductPage = { data: Product[]; meta: PaginationMetadata };

export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = 'out' | 'low' | 'ok';

export function stockLevel(stock: number): StockLevel {
  if (stock === 0) return 'out';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low';
  return 'ok';
}

const productKeys = {
  all: ['products'] as const,
  // Todo lo que depende del catálogo completo (páginas y totales); se invalida con cada cambio
  collection: () => [...productKeys.all, 'collection'] as const,
  list: (filters: ProductFilters) => [...productKeys.collection(), 'list', filters] as const,
  summary: () => [...productKeys.collection(), 'summary'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

function productsPath(filters: ProductFilters): string {
  const params = new URLSearchParams();
  // Los filtros sin valor llegan como undefined y no se envían
  for (const [key, value] of Object.entries<string | number | undefined>(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/api/products?${query}` : '/api/products';
}

const productPath = (id: string) => `/api/products/${encodeURIComponent(id)}`;

function fetchProducts(filters: ProductFilters): Promise<ProductPage> {
  return apiClient.get<ProductPage>(productsPath(filters));
}

// null significa "no existe"; cualquier otra falla se propaga
async function fetchProduct(id: string): Promise<Product | null> {
  try {
    return await apiClient.get<Product>(productPath(id));
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) return null;
    throw error;
  }
}

/** Página de productos. Mientras carga una página nueva se sigue mostrando la anterior. */
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  });
}

/** Detalle de un producto; `data` es null si no existe. Con id null no hace ninguna petición. */
export function useProduct(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: id ? () => fetchProduct(id) : skipToken,
  });
}

/** Crea el producto si no recibe id; si lo recibe, lo actualiza. Refresca listas y totales al terminar. */
export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ProductInput }) =>
      id ? apiClient.patch<Product>(productPath(id), input) : apiClient.post<Product>('/api/products', input),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product);
      return queryClient.invalidateQueries({ queryKey: productKeys.collection() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(productPath(id)),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: productKeys.collection() });
    },
  });
}

export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: () => apiClient.get<Brand[]>('/api/brands') });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => apiClient.get<Category[]>('/api/categories') });
}

export type StockSummary = { total: number; lowStock: number };

async function fetchStockSummary(): Promise<StockSummary> {
  const [all, low] = await Promise.all([
    fetchProducts({ limit: 1 }),
    fetchProducts({ limit: 1, maxStock: LOW_STOCK_THRESHOLD }),
  ]);
  return { total: all.meta.total, lowStock: low.meta.total };
}

/** Total de productos y cuántos tienen stock bajo. Solo pide la metadata (limit 1), no el catálogo. */
export function useStockSummary() {
  return useQuery({ queryKey: productKeys.summary(), queryFn: fetchStockSummary });
}
