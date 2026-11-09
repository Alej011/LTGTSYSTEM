import type { NextRequest } from "next/server"
import { PaginatedProductsSchema, ProductFiltersSchema } from "@/lib/schemas/product.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { errorResponse, proxyToBackend } from "@/lib/server/backend"

const NUMERIC_FILTERS = new Set(["maxStock", "page", "limit"])

export function GET(request: NextRequest) {
  const raw: Record<string, string | number> = {}
  for (const [key, value] of request.nextUrl.searchParams) {
    if (value !== "") raw[key] = NUMERIC_FILTERS.has(key) ? Number(value) : value
  }

  const filters = ProductFiltersSchema.strict().safeParse(raw)
  if (!filters.success) {
    return errorResponse(400, "Parámetros de búsqueda inválidos", "VALIDATION_ERROR", filters.error.issues)
  }

  const query = new URLSearchParams(
    Object.entries(filters.data).flatMap(([key, value]) => (value === undefined ? [] : [[key, String(value)]])),
  ).toString()

  return proxyToBackend({
    path: `${API_ENDPOINTS.products.list}${query ? `?${query}` : ""}`,
    schema: PaginatedProductsSchema,
    errorMessage: "Error al obtener productos",
  })
}
