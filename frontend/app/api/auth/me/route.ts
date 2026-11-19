import { CurrentUserResponseSchema, mapBackendUserToFrontend } from '@/lib/schemas/auth.schema';
import { proxyToBackend } from '@/lib/server/backend';

export function GET() {
  return proxyToBackend({
    path: '/api/auth/me',
    schema: CurrentUserResponseSchema,
    map: mapBackendUserToFrontend,
    errorMessage: 'Error al obtener usuario',
  });
}
