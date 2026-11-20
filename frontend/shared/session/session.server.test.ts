// @vitest-environment node
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { endSession, type RefreshSession, resolveSession, type SessionTokens, startSession } from './session.server';

vi.mock('server-only', () => ({}));

const SECRET = 'test-secret-with-at-least-32-characters!';
const user = { id: 'u1', email: 'admin@ltgt.com', name: 'Admin', role: 'ADMIN' as const };

beforeAll(() => {
  vi.stubEnv('JWT_ACCESS_SECRET', SECRET);
});

function accessToken({ expiresInSeconds = 900, secret = SECRET } = {}) {
  return new SignJWT({ role: user.role, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(new TextEncoder().encode(secret));
}

async function tokens(): Promise<SessionTokens> {
  const inOneHour = new Date(Date.now() + 3_600_000).toISOString();
  return {
    accessToken: await accessToken(),
    accessTokenExpiresAt: inOneHour,
    refreshToken: 'r'.repeat(43),
    refreshTokenExpiresAt: inOneHour,
    user,
  };
}

function request(cookies: Record<string, string>) {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  return new NextRequest('http://localhost/dashboard', { headers: { cookie, 'x-forwarded-for': '203.0.113.7' } });
}

// Nombre y valor de cada cookie que la respuesta escribe en el navegador
function setCookies(response: NextResponse): Record<string, string> {
  return Object.fromEntries(response.cookies.getAll().map((cookie) => [cookie.name, cookie.value]));
}

// Cookies que ve la ruta o página de esta misma petición después del proxy
function forwardedCookies(response: NextResponse): string {
  return response.headers.get('x-middleware-request-cookie') ?? '';
}

const unusedRefresh: RefreshSession = () => {
  throw new Error('no debería renovar');
};

describe('resolveSession', () => {
  it('accepts a valid access token without renewing or touching cookies', async () => {
    const resolved = await resolveSession(request({ ltgt_access_token: await accessToken() }), unusedRefresh);

    expect(resolved.session).toEqual({ userId: 'u1', role: 'ADMIN', email: 'admin@ltgt.com', name: 'Admin' });
    expect(setCookies(resolved.next())).toEqual({});
  });

  it('renews an expired session and lets the same request see the new token', async () => {
    const renewed = await tokens();
    const refresh = vi.fn<RefreshSession>().mockResolvedValue(renewed);
    const expired = await accessToken({ expiresInSeconds: -60 });

    const resolved = await resolveSession(
      request({ ltgt_access_token: expired, ltgt_refresh_token: 'old-refresh' }),
      refresh,
    );
    const response = resolved.next();

    expect(refresh).toHaveBeenCalledWith('old-refresh', '203.0.113.7');
    expect(resolved.session?.userId).toBe('u1');
    expect(setCookies(response)).toEqual({
      ltgt_access_token: renewed.accessToken,
      ltgt_refresh_token: renewed.refreshToken,
    });
    expect(forwardedCookies(response)).toContain(renewed.accessToken);
  });

  it('renews a token that expires within the safety margin', async () => {
    const refresh = vi.fn<RefreshSession>().mockResolvedValue(await tokens());

    await resolveSession(
      request({ ltgt_access_token: await accessToken({ expiresInSeconds: 10 }), ltgt_refresh_token: 'r' }),
      refresh,
    );

    expect(refresh).toHaveBeenCalled();
  });

  it('keeps the renewed cookies on a redirect', async () => {
    const renewed = await tokens();
    const resolved = await resolveSession(
      request({ ltgt_refresh_token: 'old-refresh' }),
      vi.fn<RefreshSession>().mockResolvedValue(renewed),
    );

    const response = resolved.apply(NextResponse.redirect('http://localhost/dashboard'));

    expect(setCookies(response).ltgt_refresh_token).toBe(renewed.refreshToken);
  });

  it('ends the session when the refresh is rejected', async () => {
    const resolved = await resolveSession(
      request({ ltgt_access_token: 'not-a-jwt', ltgt_refresh_token: 'revoked' }),
      vi.fn<RefreshSession>().mockResolvedValue(null),
    );
    const response = resolved.next();

    expect(resolved.session).toBeNull();
    expect(setCookies(response)).toEqual({ ltgt_access_token: '', ltgt_refresh_token: '' });
    expect(forwardedCookies(response)).not.toContain('not-a-jwt');
  });

  it('rejects a token signed with another secret', async () => {
    const forged = await accessToken({ secret: 'another-secret-with-at-least-32-chars!!' });

    const resolved = await resolveSession(request({ ltgt_access_token: forged }), unusedRefresh);

    expect(resolved.session).toBeNull();
  });

  it('leaves a visitor without cookies untouched', async () => {
    const resolved = await resolveSession(request({}), unusedRefresh);

    expect(resolved.session).toBeNull();
    expect(setCookies(resolved.apply(NextResponse.redirect('http://localhost/')))).toEqual({});
  });
});

describe('startSession and endSession', () => {
  it('stores each token in an HttpOnly cookie that lives as long as the token', async () => {
    const session = await tokens();
    const response = NextResponse.json({});

    startSession(response, session);

    const access = response.cookies.get('ltgt_access_token');
    expect(access).toMatchObject({ value: session.accessToken, httpOnly: true, sameSite: 'lax', path: '/' });
    expect(access?.expires).toEqual(new Date(session.accessTokenExpiresAt));
  });

  it('keeps the current refresh cookie when the backend sends no new refresh token', async () => {
    const response = NextResponse.json({});

    startSession(response, { ...(await tokens()), refreshToken: undefined, refreshTokenExpiresAt: undefined });

    expect(response.cookies.get('ltgt_refresh_token')).toBeUndefined();
  });

  it('expires both cookies on logout', () => {
    const response = NextResponse.json({});

    endSession(response);

    expect(response.cookies.get('ltgt_access_token')).toMatchObject({ value: '', maxAge: 0 });
    expect(response.cookies.get('ltgt_refresh_token')).toMatchObject({ value: '', maxAge: 0 });
  });
});
