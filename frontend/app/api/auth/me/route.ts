import { CurrentUserResponseSchema, mapBackendUserToFrontend } from '@/lib/schemas/auth.schema';
import { proxyToBackend } from '@/lib/server/backend';
import { API_ENDPOINTS } from '@/lib/shared/api-config';

export function GET() {
  return proxyToBackend({
    path: API_ENDPOINTS.auth.me,
    schema: CurrentUserResponseSchema,
    map: mapBackendUserToFrontend,
    errorMessage: 'Error al obtener usuario',
  });
}
