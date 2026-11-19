import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { callBackend } from '@/lib/server/backend';
import { clearSessionCookies, REFRESH_COOKIE } from '@/lib/server/session';
import { API_ENDPOINTS } from '@/lib/shared/api-config';

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    const result = await callBackend({
      path: API_ENDPOINTS.auth.logout,
      method: 'POST',
      body: { refreshToken },
      errorMessage: 'Error al cerrar sesión',
      auth: false,
    });
    // Las cookies se borran igual: un fallo del backend no debe dejar la sesión abierta en el navegador
    if (!result.ok) console.error('[BFF] No se pudo revocar el refresh token:', result.status);
  }

  const response = new NextResponse(null, { status: 204 });
  clearSessionCookies(response);
  return response;
}
