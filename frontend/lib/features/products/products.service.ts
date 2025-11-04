import { apiClient, ApiClientError } from "@/lib/shared/api-client";
import { API_ENDPOINTS } from "@/lib/shared/api-config";

// ====================================
// TIPOS Y INTERFACES
// ====================================

export interface Brand {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO string from backend
  updatedAt: string; // ISO string from backend
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Respuesta del backend para productos (después de transformación en service)
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "discontinued";
  brandId: string;
  brand: {
    id: string;
    name: string;
  };
  // Categorías ya transformadas (aplanadas) desde el backend
  categories: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para el frontend (transformada)
export interface Product {
  id: string;
  name: string;
  description: string;
  brandId: string;
  brand?: Brand;
  sku: string;
  stock: number;
  price: number;
  categories: Category[]; // Cambiado de category: string a categories: Category[]
  status: "active" | "inactive" | "discontinued";
  createdAt: string; // ISO string from backend
  updatedAt: string; // ISO string from backend
}

// ====================================
// MAPPERS (Backend → Frontend)
// ====================================

/**
 * Convierte la respuesta del backend a la interfaz Product del frontend
 * Las fechas se mantienen como strings ISO del backend
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
      createdAt: backendProduct.createdAt, // Keep as ISO string
      updatedAt: backendProduct.updatedAt, // Keep as ISO string
    },
    // Las categorías ya vienen aplanadas desde el backend
    categories: backendProduct.categories || [],
    createdAt: backendProduct.createdAt, // Keep as ISO string
    updatedAt: backendProduct.updatedAt, // Keep as ISO string
  };
}

// ====================================
// TIPOS PARA PAGINACIÓN
// ====================================

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginationMetadata;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: "active" | "inactive" | "discontinued";
  brandId?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ====================================
// FUNCIONES DE API (reemplazan mocks)
// ====================================

/**
 * Obtiene productos con paginación y filtros del BFF
 */
export const getProducts = async (
  filters?: ProductFilters
): Promise<PaginatedProducts> => {
  try {
    // Construir query params
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.brandId) params.append("brandId", filters.brandId);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/products/list?${queryString}` // BFF endpoint
      : `/api/products/list`; // BFF endpoint

    const response = await apiClient.get<{
      data: ProductResponse[];
      meta: PaginationMetadata;
    }>(endpoint);

    // Transform backend products to frontend format (dates stay as ISO strings)
    const products = response.data.map((product) => ({
      ...product,
      brand: {
        ...product.brand,
        id: product.brand.id,
        name: product.brand.name,
        description: "",
        createdAt: product.createdAt, // Keep as ISO string
        updatedAt: product.updatedAt, // Keep as ISO string
      },
      categories: product.categories || [],
    }));

    return {
      data: products,
      meta: response.meta,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al obtener productos:", error.message);
    }
    throw error;
  }
};

/**
 * Obtiene un producto por ID desde BFF
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiClient.get<ProductResponse>(
      `/api/products/${id}` // BFF endpoint
    );

    // Transform backend product (dates stay as ISO strings)
    return {
      ...response,
      brand: response.brand ? {
        ...response.brand,
        description: "",
        createdAt: response.createdAt, // Keep as ISO string
        updatedAt: response.updatedAt, // Keep as ISO string
      } : undefined,
      categories: response.categories || [],
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al obtener producto ${id}:`, error.message);
    }
    return null;
  }
};

/**
 * Crea un nuevo producto a través del BFF
 */
export const createProduct = async (
  productData: Omit<
    Product,
    "id" | "createdAt" | "updatedAt" | "categories" | "brand"
  > & {
    categoryIds: string[]; // Agregar categoryIds requerido por el backend
  }
): Promise<Product | null> => {
  try {
    const response = await apiClient.post<ProductResponse>(
      `/api/products/create`, // BFF endpoint
      productData
    );

    // Transform backend product (dates stay as ISO strings)
    return {
      ...response,
      brand: response.brand ? {
        ...response.brand,
        description: "",
        createdAt: response.createdAt, // Keep as ISO string
        updatedAt: response.updatedAt, // Keep as ISO string
      } : undefined,
      categories: response.categories || [],
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al crear producto:", error.message);
    }
    throw error;
  }
};

/**
 * Actualiza un producto existente a través del BFF
 */
export const updateProduct = async (
  id: string,
  productData: Partial<
    Omit<Product, "id" | "createdAt" | "updatedAt" | "categories" | "brand">
  > & {    categoryIds?: string[]; // categoryIds opcional para actualización
  }
): Promise<Product | null> => {
  try {
    const response = await apiClient.patch<ProductResponse>(
      `/api/products/${id}`, // BFF endpoint
      productData
    );

    // Transform backend product (dates stay as ISO strings)
    return {
      ...response,
      brand: response.brand ? {
        ...response.brand,
        description: "",
        createdAt: response.createdAt, // Keep as ISO string
        updatedAt: response.updatedAt, // Keep as ISO string
      } : undefined,
      categories: response.categories || [],
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al actualizar producto ${id}:`, error.message);
    }
    throw error;
  }
};

/**
 * Elimina un producto a través del BFF
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/products/${id}`); // BFF endpoint
    return true;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(`Error al eliminar producto ${id}:`, error.message);
    }
    return false;
  }
};

/**
 * Obtiene todas las marcas desde el BFF
 */
export const getBrands = async (): Promise<Brand[]> => {
  try {
    const response = await apiClient.get<Brand[]>(`/api/brands`); // BFF endpoint

    // Dates are already ISO strings from BFF, just return as-is
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al obtener marcas:", error.message);
    }
    return [];
  }
};

/**
 * Obtiene todas las categorías desde el BFF
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>(`/api/categories`); // BFF endpoint
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Error al obtener categorías:", error.message);
    }
    return [];
  }
};
