import {
  BackendUserListItemSchema,
  mapBackendUserListItemToFrontend,
  UsersListResponseSchema,
} from '@/features/users/users.schemas';
import { proxyToBackend, readJsonBody } from '@/lib/server/backend';

export function GET() {
  return proxyToBackend({
    path: '/api/users',
    schema: UsersListResponseSchema,
    map: (users) => users.map(mapBackendUserListItemToFrontend),
    errorMessage: 'Error al obtener usuarios',
  });
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
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
