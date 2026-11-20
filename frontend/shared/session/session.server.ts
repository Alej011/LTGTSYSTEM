/**
 * Módulo de sesión del servidor. Es el único que conoce las cookies de sesión y el flujo de refresh.
 * - El proxy usa resolveSession: verifica el access token y, si expiró, renueva con el refresh token.
 * - Layouts y rutas BFF usan getSession, getAccessToken y getRefreshToken (no renuevan: eso ya lo hizo el proxy).
 * - Login y logout usan startSession y endSession.
 */
import 'server-only';

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { API_BASE_URL, API_TIMEOUT } from '@/shared/api/api-config';
import { getClientIp } from '@/shared/api/client-ip';
import { type ApiSchemas, matchesContract } from '@/shared/api/contract';
import type { Role } from '@/shared/roles';
import { EmailSchema, IdSchema, RoleSchema } from '@/shared/schemas';

const ACCESS_COOKIE = 'ltgt_access_token';
const REFRESH_COOKIE = 'ltgt_refresh_token';

// Margen para renovar antes de que el backend rechace un token a punto de expirar
const EXPIRY_MARGIN_SECONDS = 30;

export type Session = { userId: string; role: Role; email: string; name: string };

const AccessPayloadSchema = z.object({
  sub: z.string(),
  role: RoleSchema,
  email: z.string(),
  name: z.string(),
  exp: z.number(),
});

export const SessionTokensSchema = matchesContract<ApiSchemas['SessionTokensDto']>()(
  z.object({
    accessToken: z.string(),
    accessTokenExpiresAt: z.iso.datetime(),
    refreshToken: z.string().optional(),
    refreshTokenExpiresAt: z.iso.datetime().optional(),
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      role: RoleSchema,
    }),
  }),
);

export type SessionTokens = z.infer<typeof SessionTokensSchema>;

/** Usuario de la sesión como lo devuelve el backend en /auth/me */
export const CurrentUserSchema = matchesContract<ApiSchemas['CurrentUserDto']>()(
  z.object({
    id: IdSchema,
    email: EmailSchema,
    name: z.string(),
    role: RoleSchema,
    createdAt: z.string(),
  }),
);

/** Renueva la sesión con el refresh token; null si no se pudo. Los tests pasan su propia implementación. */
export type RefreshSession = (refreshToken: string, clientIp: string | null) => Promise<SessionTokens | null>;

export const refreshWithBackend: RefreshSession = async (refreshToken, clientIp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientIp ? { 'X-Forwarded-For': clientIp } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(API_TIMEOUT),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const parsed = SessionTokensSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

let secretKey: Uint8Array | undefined;

function getSecret(): Uint8Array {
  if (!secretKey) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_ACCESS_SECRET no está definido o tiene menos de 32 caracteres');
    }
    secretKey = new TextEncoder().encode(secret);
  }
  return secretKey;
}

// Verifica firma y expiración. Devuelve null si el token no es válido o expira en menos del margen.
async function verifyAccessToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    const parsed = AccessPayloadSchema.safeParse(payload);
    if (!parsed.success) return null;
    if (parsed.data.exp - EXPIRY_MARGIN_SECONDS <= Date.now() / 1000) return null;
    const { sub, role, email, name } = parsed.data;
    return { userId: sub, role, email, name };
  } catch {
    return null;
  }
}

// En producción las cookies son Secure (solo HTTPS) salvo que SESSION_COOKIE_SECURE=false
function isSecureCookie(): boolean {
  const flag = process.env.SESSION_COOKIE_SECURE;
  if (flag === 'true' || flag === 'false') return flag === 'true';
  return process.env.NODE_ENV === 'production';
}

function cookieOptions(expires: Date) {
  return { httpOnly: true, secure: isSecureCookie(), sameSite: 'lax' as const, path: '/', expires };
}

/** Guarda los tokens en cookies HttpOnly; cada cookie vive lo mismo que su token. */
export function startSession(response: NextResponse, tokens: SessionTokens): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(new Date(tokens.accessTokenExpiresAt)));
  if (tokens.refreshToken && tokens.refreshTokenExpiresAt) {
    response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(new Date(tokens.refreshTokenExpiresAt)));
  }
}

export function endSession(response: NextResponse): void {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    response.cookies.set(name, '', { ...cookieOptions(new Date(0)), maxAge: 0 });
  }
}

/** Sesión de la petición en curso, para Server Components y rutas BFF. */
export async function getSession(): Promise<Session | null> {
  return verifyAccessToken((await cookies()).get(ACCESS_COOKIE)?.value);
}

/** Access token para llamar al backend desde el BFF. */
export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

/** Refresh token para revocarlo al cerrar sesión. */
export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export interface ResolvedSession {
  session: Session | null;
  /** Continúa la petición con las cookies al día: el token renovado, o sin el token inválido. */
  next: () => NextResponse;
  /** Lleva a otra respuesta (p. ej. una redirección) las cookies renovadas o su borrado. */
  apply: (response: NextResponse) => NextResponse;
}

/** Sesión de una petición en el proxy, renovándola si el access token expiró y hay refresh token. */
export async function resolveSession(
  request: NextRequest,
  refresh: RefreshSession = refreshWithBackend,
): Promise<ResolvedSession> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let session = await verifyAccessToken(accessToken);
  let renewed: SessionTokens | null = null;
  if (!session && refreshToken) {
    renewed = await refresh(refreshToken, getClientIp(request.headers));
    session = renewed ? await verifyAccessToken(renewed.accessToken) : null;
  }
  const ended = !session && (accessToken !== undefined || refreshToken !== undefined);

  const apply = (response: NextResponse) => {
    if (session && renewed) startSession(response, renewed);
    else if (ended) endSession(response);
    return response;
  };

  const next = () => {
    if (session && !renewed) return NextResponse.next();
    // La ruta o página de esta misma petición debe ver ya el token renovado, o no ver el inválido
    if (session && renewed) request.cookies.set(ACCESS_COOKIE, renewed.accessToken);
    else request.cookies.delete(ACCESS_COOKIE);
    return apply(NextResponse.next({ request: { headers: request.headers } }));
  };

  return { session, next, apply };
}
