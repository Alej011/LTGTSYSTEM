import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getRoleFromToken } from "@/lib/shared/jwt"
import { STORAGE_KEYS } from "@/lib/shared/api-config"

const PROTECTED_ROUTES = ["/dashboard", "/products", "/users", "/tickets", "/knowledge", "/communications"]
const ADMIN_ONLY_ROUTES = ["/users"]

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!matchesRoute(pathname, PROTECTED_ROUTES)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.search = ""
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (matchesRoute(pathname, ADMIN_ONLY_ROUTES) && getRoleFromToken(token) !== "admin") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
