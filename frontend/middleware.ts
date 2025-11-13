import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getRoleFromToken } from "@/lib/shared/jwt"

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/products",
  "/users",
  "/tickets",
  "/knowledge",
  "/communications",
]

const ADMIN_ONLY_ROUTES = [
  "/users", // User management only for admins
]

const PUBLIC_ROUTES = ["/", "/login"]

/**
 * Check if a path matches any of the route patterns
 */
function normalizePath(path: string): string {
  if (!path.startsWith("/_next/data/")) return path

  const cleaned = path.replace(/^\/_next\/data\/[^/]+/, "")
  const withoutJson = cleaned.replace(/\.json$/, "")

  return withoutJson || "/"
}

function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => path.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const normalizedPath = normalizePath(pathname)

  // Allow public routes
  if (matchesRoute(normalizedPath, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  // Check if route is protected
  if (matchesRoute(normalizedPath, PROTECTED_ROUTES)) {
    
    const token = request.cookies.get("ltgt_access_token")?.value

    // If no token, redirect to login
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("redirect", normalizedPath) 
      return NextResponse.redirect(url)
    }

    if (matchesRoute(normalizedPath, ADMIN_ONLY_ROUTES)) {
      const role = getRoleFromToken(token)
      if (role !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }

    // Allow access
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
