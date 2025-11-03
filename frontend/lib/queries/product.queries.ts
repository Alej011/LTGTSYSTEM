/**
 * React Query hooks for products
 */
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  getCategories,
  type Product,
  type ProductFilters,
  type PaginatedProducts,
  type Brand,
  type Category,
} from "@/lib/products"

/**
 * Query keys for product-related queries
 * Organized hierarchically for easy invalidation
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters = {}) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  brands: () => ["brands"] as const,
  categories: () => ["categories"] as const,
}

/**
 * Hook to get paginated products with filters
 *
 * @example
 * const { data, isLoading } = useProducts({ page: 1, limit: 20, status: "active" })
 */
export function useProducts(
  filters: ProductFilters = {},
  options?: Omit<UseQueryOptions<PaginatedProducts>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    ...options,
  })
}

/**
 * Hook to get a single product by ID
 *
 * @example
 * const { data: product } = useProduct(productId)
 */
export function useProduct(
  id: string,
  options?: Omit<UseQueryOptions<Product | null>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  })
}

/**
 * Hook to create a product
 *
 * @example
 * const createMutation = useCreateProduct()
 * createMutation.mutate(productData, {
 *   onSuccess: () => toast.success("Producto creado"),
 *   onError: (error) => toast.error(error.getUserMessage())
 * })
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate and refetch product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

/**
 * Hook to update a product
 *
 * @example
 * const updateMutation = useUpdateProduct()
 * updateMutation.mutate({ id: "123", data: { name: "New Name" } })
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

/**
 * Hook to delete a product
 *
 * @example
 * const deleteMutation = useDeleteProduct()
 * deleteMutation.mutate(productId, {
 *   onSuccess: () => toast.success("Producto eliminado")
 * })
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, productId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

/**
 * Hook to get all brands
 *
 * @example
 * const { data: brands } = useBrands()
 */
export function useBrands(options?: Omit<UseQueryOptions<Brand[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: productKeys.brands(),
    queryFn: getBrands,
    staleTime: 10 * 60 * 1000, // 10 minutos - brands don't change often
    ...options,
  })
}

/**
 * Hook to get all categories
 *
 * @example
 * const { data: categories } = useCategories()
 */
export function useCategories(options?: Omit<UseQueryOptions<Category[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutos - categories don't change often
    ...options,
  })
}
