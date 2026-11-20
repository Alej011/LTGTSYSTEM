import { proxyToBackend } from '@/shared/api/bff.server';
import { CurrentUserSchema } from '@/shared/session/session.server';

export function GET() {
  return proxyToBackend({
    path: '/api/auth/me',
    schema: CurrentUserSchema,
    errorMessage: 'Error al obtener usuario',
  });
}
