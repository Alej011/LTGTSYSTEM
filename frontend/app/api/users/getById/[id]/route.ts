import { BackendUserListItemSchema, mapBackendUserListItemToFrontend } from "@/lib/schemas/user.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { proxyToBackend } from "@/lib/server/backend"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyToBackend({
    path: API_ENDPOINTS.users.detail(id),
    schema: BackendUserListItemSchema,
    map: mapBackendUserListItemToFrontend,
    errorMessage: "Error al obtener usuario",
  })
}
