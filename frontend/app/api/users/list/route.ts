import { mapBackendUserListItemToFrontend,UsersListResponseSchema } from "@/lib/schemas/user.schema"
import { proxyToBackend } from "@/lib/server/backend"
import { API_ENDPOINTS } from "@/lib/shared/api-config"

export function GET() {
  return proxyToBackend({
    path: API_ENDPOINTS.users.list,
    schema: UsersListResponseSchema,
    map: (users) => users.map(mapBackendUserListItemToFrontend),
    errorMessage: "Error al obtener usuarios",
  })
}
