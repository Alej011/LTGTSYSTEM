import { BrandsResponseSchema } from "@/lib/schemas/product.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { proxyToBackend } from "@/lib/server/backend"

export function GET() {
  return proxyToBackend({
    path: API_ENDPOINTS.brands.list,
    schema: BrandsResponseSchema,
    errorMessage: "Error al obtener marcas",
  })
}
