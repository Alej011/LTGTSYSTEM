import { BackendUserListItemSchema, CreateUserRequestSchema, mapBackendUserListItemToFrontend } from "@/lib/schemas/user.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { parseBody, proxyToBackend } from "@/lib/server/backend"

export async function POST(request: Request) {
  const body = await parseBody(request, CreateUserRequestSchema, "Datos del usuario inválidos")
  if (body.response) return body.response

  return proxyToBackend({
    path: API_ENDPOINTS.users.create,
    method: "POST",
    body: body.data,
    schema: BackendUserListItemSchema,
    map: mapBackendUserListItemToFrontend,
    status: 201,
    errorMessage: "Error al crear usuario",
  })
}
