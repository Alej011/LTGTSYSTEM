import "server-only"
import { jwtVerify } from "jose"
import type { NextResponse } from "next/server"
import { z } from "zod"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/shared/api-config"

export const ACCESS_COOKIE = "ltgt_access_token"
export const REFRESH_COOKIE = "ltgt_refresh_token"

// Margen para renovar antes de que el backend rechace un token a punto de expirar
const EXPIRY_MARGIN_SECONDS = 30

const AccessPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(["ADMIN", "SUPPORT"]),
  email: z.string(),
  name: z.string(),
  exp: z.number(),
})

export type AccessPayload = z.infer<typeof AccessPayloadSchema>

export const SessionTokensSchema = z.object({
  accessToken: z.string(),
  accessTokenExpiresAt: z.iso.datetime(),
  refreshToken: z.string().optional(),
  refreshTokenExpiresAt: z.iso.datetime().optional(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.enum(["ADMIN", "SUPPORT"]),
  }),
})

export type SessionTokens = z.infer<typeof SessionTokensSchema>

let secretKey: Uint8Array | undefined

function getSecret(): Uint8Array {
  if (!secretKey) {
    const secret = process.env.JWT_ACCESS_SECRET
    if (!secret || secret.length < 32) {
      throw new Error("JWT_ACCESS_SECRET no está definido o tiene menos de 32 caracteres")
    }
    secretKey = new TextEncoder().encode(secret)
  }
  return secretKey
}

// Verifica firma y expiración. Devuelve null si el token no es válido o expira en menos del margen.
export async function verifyAccessToken(token: string | undefined): Promise<AccessPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] })
    const parsed = AccessPayloadSchema.safeParse(payload)
    if (!parsed.success) return null
    if (parsed.data.exp - EXPIRY_MARGIN_SECONDS <= Date.now() / 1000) return null
    return parsed.data
  } catch {
    return null
  }
}

export async function refreshSession(refreshToken: string, clientIp: string | null): Promise<SessionTokens | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    })
    if (!response.ok) return null
    const parsed = SessionTokensSchema.safeParse(await response.json())
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

// En producción las cookies son Secure (solo HTTPS) salvo que SESSION_COOKIE_SECURE=false
function isSecureCookie(): boolean {
  const flag = process.env.SESSION_COOKIE_SECURE
  if (flag === "true" || flag === "false") return flag === "true"
  return process.env.NODE_ENV === "production"
}

function cookieOptions(path: string, expires: string) {
  return {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax" as const,
    path,
    expires: new Date(expires),
  }
}

// La cookie vive lo mismo que el token que guarda
export function setSessionCookies(response: NextResponse, tokens: SessionTokens): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions("/", tokens.accessTokenExpiresAt))
  if (tokens.refreshToken && tokens.refreshTokenExpiresAt) {
    response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions("/", tokens.refreshTokenExpiresAt))
  }
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions("/", new Date(0).toISOString()), maxAge: 0 })
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions("/", new Date(0).toISOString()), maxAge: 0 })
}

// Primera IP de X-Forwarded-For. Solo es fiable si un proxy de confianza delante de Next la sobrescribe.
export function getClientIp(headers: Headers): string | null {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
}
