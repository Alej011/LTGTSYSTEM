import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  getClientIp,
  refreshSession,
  setSessionCookies,
  verifyAccessToken,
  type AccessPayload,
  type SessionTokens,
} from "@/lib/server/session"

const PROTECTED_ROUTES = ["/dashboard", "/products", "/users", "/tickets", "/knowledge", "/communications"]
const ADMIN_ONLY_ROUTES = ["/users"]
// Rutas BFF que gestionan la sesión por sí mismas
const SESSION_ROUTES = new Set(["/api/auth/login", "/api/auth/logout"])

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function redirectTo(request: NextRequest, pathname: string, params?: Record<string, string>) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value)
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith("/api/")
  const isProtectedPage = matchesRoute(pathname, PROTECTED_ROUTES)

  if ((isApi && SESSION_ROUTES.has(pathname)) || (!isApi && !isProtectedPage)) {
    return NextResponse.next()
  }

  let session: AccessPayload | null = await verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value)
  let refreshed: SessionTokens | null = null
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value

  if (!session && refreshToken) {
    refreshed = await refreshSession(refreshToken, getClientIp(request.headers))
    session = refreshed ? await verifyAccessToken(refreshed.accessToken) : null
  }

  if (!session) {
    const hadSession = request.cookies.has(ACCESS_COOKIE) || !!refreshToken
    let response: NextResponse
    if (isApi) {
      // La ruta BFF responde 401 al no encontrar la cookie
      request.cookies.delete(ACCESS_COOKIE)
      response = NextResponse.next({ request: { headers: request.headers } })
    } else {
      response = redirectTo(request, "/", { redirect: pathname })
    }
    if (hadSession) clearSessionCookies(response)
    return response
  }

  if (isProtectedPage && matchesRoute(pathname, ADMIN_ONLY_ROUTES) && session.role !== "ADMIN") {
    return redirectTo(request, "/dashboard")
  }

  if (!refreshed) return NextResponse.next()

  // La ruta o página de esta misma petición debe ver ya el token renovado
  request.cookies.set(ACCESS_COOKIE, refreshed.accessToken)
  const response = NextResponse.next({ request: { headers: request.headers } })
  setSessionCookies(response, refreshed)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
}
