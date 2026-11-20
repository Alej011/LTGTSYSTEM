import { UserSchema, UsersListResponseSchema } from '@/features/users/users.schemas';
import { proxyToBackend, readJsonBody } from '@/shared/api/bff.server';

export function GET() {
  return proxyToBackend({
    path: '/api/users',
    schema: UsersListResponseSchema,
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
    schema: UserSchema,
    status: 201,
    errorMessage: 'Error al crear usuario',
  });
}
