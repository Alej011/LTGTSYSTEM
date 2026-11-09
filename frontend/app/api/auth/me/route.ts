import { CurrentUserResponseSchema, mapBackendUserToFrontend } from "@/lib/schemas/auth.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { proxyToBackend } from "@/lib/server/backend"

export function GET() {
  return proxyToBackend({
    path: API_ENDPOINTS.auth.me,
    schema: CurrentUserResponseSchema,
    map: mapBackendUserToFrontend,
    errorMessage: "Error al obtener usuario",
  })
}
