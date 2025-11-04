/**
 * Next.js Middleware for Route Protection
 * Runs on Edge Runtime - very fast
 *
 * Protects routes that require authentication
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

/**
 * Routes that only admins can access
 */
const ADMIN_ONLY_ROUTES = [
  "/users", // User management only for admins
]

/**
 * Public routes (no auth required)
 */
const PUBLIC_ROUTES = ["/", "/login"]

/**
 * Check if a path matches any of the route patterns
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => path.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  // Check if route is protected
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    // Get token from localStorage (via cookie or header)
    // Note: localStorage is not accessible in middleware
    // We need to use cookies or headers instead
    const token = request.cookies.get("ltgt_access_token")?.value

    // If no token, redirect to login
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("redirect", pathname) // Save original URL for redirect after login
      return NextResponse.redirect(url)
    }

    // TODO: If route is admin-only, verify role from token
    // For now, we'll handle this in the layout component
    // because decoding JWT in middleware requires additional setup

    // Allow access
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

/**
 * Configure which routes to run middleware on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
