import { UsersListResponseSchema, mapBackendUserListItemToFrontend } from "@/lib/schemas/user.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { proxyToBackend } from "@/lib/server/backend"

export function GET() {
  return proxyToBackend({
    path: API_ENDPOINTS.users.list,
    schema: UsersListResponseSchema,
    map: (users) => users.map(mapBackendUserListItemToFrontend),
    errorMessage: "Error al obtener usuarios",
  })
}
