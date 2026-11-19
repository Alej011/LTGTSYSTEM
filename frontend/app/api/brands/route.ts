import { BrandsResponseSchema } from "@/lib/schemas/product.schema"
import { proxyToBackend } from "@/lib/server/backend"
import { API_ENDPOINTS } from "@/lib/shared/api-config"

export function GET() {
  return proxyToBackend({
    path: API_ENDPOINTS.brands.list,
    schema: BrandsResponseSchema,
    errorMessage: "Error al obtener marcas",
  })
}
