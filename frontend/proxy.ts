import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { canOpenPage } from '@/shared/permissions';
import { resolveSession } from '@/shared/session/session.server';

const PROTECTED_ROUTES = ['/dashboard', '/products', '/users', '/tickets', '/knowledge', '/communications'];
// Rutas BFF que gestionan la sesión por sí mismas
const SESSION_ROUTES = new Set(['/api/auth/login', '/api/auth/logout']);

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectTo(request: NextRequest, pathname: string, params?: Record<string, string>) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const isProtectedPage = matchesRoute(pathname, PROTECTED_ROUTES);

  if ((isApi && SESSION_ROUTES.has(pathname)) || (!isApi && !isProtectedPage)) {
    return NextResponse.next();
  }

  const { session, next, apply } = await resolveSession(request);

  // Sin sesión, la ruta BFF responde 401 por sí misma; una página lleva al login
  if (!session) return isApi ? next() : apply(redirectTo(request, '/', { redirect: pathname }));

  if (isProtectedPage && !canOpenPage(session.role, pathname)) {
    return apply(redirectTo(request, '/dashboard'));
  }

  return next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'],
};
