import { NextResponse } from 'next/server';

import { mapBackendUserToFrontend } from '@/lib/schemas/auth.schema';
import { callBackend, readJsonBody } from '@/shared/api/bff.server';
import { SessionTokensSchema, startSession } from '@/shared/session/session.server';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (body.response) return body.response;

  const result = await callBackend({
    path: '/api/auth/login',
    method: 'POST',
    body: body.data,
    schema: SessionTokensSchema,
    errorMessage: 'Error al iniciar sesión',
    auth: false,
  });
  if (!result.ok) return result.response;

  // Los tokens viajan solo en cookies HttpOnly; el navegador recibe únicamente el usuario
  const response = NextResponse.json({ user: mapBackendUserToFrontend(result.data.user) });
  startSession(response, result.data);
  return response;
}
