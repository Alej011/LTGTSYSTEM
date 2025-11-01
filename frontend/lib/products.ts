import { apiClient, ApiClientError } from "./api-client"
import { API_ENDPOINTS } from "./api-config"

// ====================================
// TIPOS Y INTERFACES
// ====================================

export interface Brand {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
}

// Respuesta del backend para productos
export interface ProductResponse {
  id: string
  name: string
  description: string
  sku: string
  price: number
  stock: number
  status: "active" | "inactive" | "discontinued"
  brandId: string
  brand: {
    id: string
    name: string
  }
  categories: Array<{
    category: {
      id: string
      name: string
    }
  }>
  createdAt: string
  updatedAt: string
}

// Interfaz para el frontend (transformada)
export interface Product {
  id: string
  name: string
  description: string
  brandId: string
  brand?: Brand
  sku: string
  stock: number
  price: number
  categories: Category[]  // Cambiado de category: string a categories: Category[]
  status: "active" | "inactive" | "discontinued"
  createdAt: Date
  updatedAt: Date
}

// ====================================
// MAPPERS (Backend → Frontend)
// ====================================

/**
 * Convierte la respuesta del backend a la interfaz Product del frontend
 */
function mapBackendProductToFrontend(backendProduct: ProductResponse): Product {
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
    // Transformar estructura de categorías many-to-many
    categories: backendProduct.categories.map(pc => ({
      id: pc.category.id,
      name: pc.category.name,
    })),
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: new Date(backendProduct.updatedAt),
  }
}

// ====================================
// FUNCIONES DE API (reemplazan mocks)
// ====================================

/**
 * Obtiene todos los productos del backend
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<ProductResponse[]>(
      API_ENDPOINTS.products.list
    )

    // Transformar array de productos del backend
    return response.map(mapBackendProductToFrontend)
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al obtener productos:", error.message)
    }
    throw error
  }
}

/**
 * Obtiene un producto por ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiClient.get<ProductResponse>(
      API_ENDPOINTS.products.detail(id)
    )
    return mapBackendProductToFrontend(response)
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al obtener producto ${id}:`, error.message)
    }
    return null
  }
}

/**
 * Crea un nuevo producto
 */
export const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "categories" | "brand">
): Promise<Product | null> => {
  try {
    const response = await apiClient.post<ProductResponse>(
      API_ENDPOINTS.products.create,
      productData
    )
    return mapBackendProductToFrontend(response)
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al crear producto:", error.message)
    }
    throw error
  }
}

/**
 * Actualiza un producto existente
 */
export const updateProduct = async (
  id: string,
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt" | "categories" | "brand">>
): Promise<Product | null> => {
  try {
    const response = await apiClient.patch<ProductResponse>(
      API_ENDPOINTS.products.update(id),
      productData
    )
    return mapBackendProductToFrontend(response)
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al actualizar producto ${id}:`, error.message)
    }
    throw error
  }
}

/**
 * Elimina un producto
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(API_ENDPOINTS.products.delete(id))
    return true
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al eliminar producto ${id}:`, error.message)
    }
    return false
  }
}

/**
 * Obtiene todas las marcas
 */
export const getBrands = async (): Promise<Brand[]> => {
  try {
    const response = await apiClient.get<Brand[]>(API_ENDPOINTS.brands.list)
    return response
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al obtener marcas:", error.message)
    }
    return []
  }
}

/**
 * Obtiene todas las categorías
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>(API_ENDPOINTS.categories.list)
    return response
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al obtener categorías:", error.message)
    }
    return []
  }
}
