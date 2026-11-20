import { BackendUserListItemSchema, mapBackendUserListItemToFrontend } from '@/features/users/users.schemas';
import { proxyToBackend, readJsonBody } from '@/shared/api/bff.server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJsonBody(request);
  if (body.response) return body.response;

  return proxyToBackend({
    path: `/api/users/${id}`,
    method: 'PATCH',
    body: body.data,
    schema: BackendUserListItemSchema,
    map: mapBackendUserListItemToFrontend,
    errorMessage: 'Error al actualizar usuario',
  });
}
