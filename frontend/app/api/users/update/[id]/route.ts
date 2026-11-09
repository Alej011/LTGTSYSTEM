import { BackendUserListItemSchema, UpdateUserRequestSchema, mapBackendUserListItemToFrontend } from "@/lib/schemas/user.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { parseBody, proxyToBackend } from "@/lib/server/backend"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await parseBody(request, UpdateUserRequestSchema, "Datos del usuario inválidos", { partial: true })
  if (body.response) return body.response

  return proxyToBackend({
    path: API_ENDPOINTS.users.update(id),
    method: "PATCH",
    body: body.data,
    schema: BackendUserListItemSchema,
    map: mapBackendUserListItemToFrontend,
    errorMessage: "Error al actualizar usuario",
  })
}
