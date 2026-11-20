import { NextResponse } from 'next/server';

import { callBackend } from '@/shared/api/bff.server';
import { endSession, getRefreshToken } from '@/shared/session/session.server';

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    const result = await callBackend({
      path: '/api/auth/logout',
      method: 'POST',
      body: { refreshToken },
      errorMessage: 'Error al cerrar sesión',
      auth: false,
    });
    // Las cookies se borran igual: un fallo del backend no debe dejar la sesión abierta en el navegador
    if (!result.ok) console.error('[BFF] No se pudo revocar el refresh token:', result.status);
  }

  const response = new NextResponse(null, { status: 204 });
  endSession(response);
  return response;
}
