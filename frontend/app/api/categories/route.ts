import { CategoriesResponseSchema } from "@/lib/schemas/product.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { proxyToBackend } from "@/lib/server/backend"

export function GET() {
  return proxyToBackend({
    path: API_ENDPOINTS.categories.list,
    schema: CategoriesResponseSchema,
    errorMessage: "Error al obtener categorías",
  })
}
