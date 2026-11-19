import {
  BackendUserListItemSchema,
  CreateUserRequestSchema,
  mapBackendUserListItemToFrontend,
  UsersListResponseSchema,
} from '@/features/users/users.schemas';
import { parseBody, proxyToBackend } from '@/lib/server/backend';

export function GET() {
  return proxyToBackend({
    path: '/api/users',
    schema: UsersListResponseSchema,
    map: (users) => users.map(mapBackendUserListItemToFrontend),
    errorMessage: 'Error al obtener usuarios',
  });
}

export async function POST(request: Request) {
  const body = await parseBody(request, CreateUserRequestSchema, 'Datos del usuario inválidos');
  if (body.response) return body.response;

  return proxyToBackend({
    path: '/api/users',
    method: 'POST',
    body: body.data,
    schema: BackendUserListItemSchema,
    map: mapBackendUserListItemToFrontend,
    status: 201,
    errorMessage: 'Error al crear usuario',
  });
}
