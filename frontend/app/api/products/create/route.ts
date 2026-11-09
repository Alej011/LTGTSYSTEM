import { BackendProductSchema, CreateProductRequestSchema } from "@/lib/schemas/product.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { parseBody, proxyToBackend } from "@/lib/server/backend"

export async function POST(request: Request) {
  const body = await parseBody(request, CreateProductRequestSchema, "Datos del producto inválidos")
  if (body.response) return body.response

  return proxyToBackend({
    path: API_ENDPOINTS.products.create,
    method: "POST",
    body: body.data,
    schema: BackendProductSchema,
    status: 201,
    errorMessage: "Error al crear producto",
  })
}
