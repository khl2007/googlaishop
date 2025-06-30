
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  // CSRF Protection
  // Exempt login/register from the check as user might not have a token on first visit
  const isCsrfExempt = pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register');
  if (STATE_CHANGING_METHODS.includes(request.method) && !isCsrfExempt) {
    const csrfTokenFromHeader = request.headers.get('x-csrf-token');
    const csrfTokenFromCookie = request.cookies.get('csrf_token')?.value;

    if (!csrfTokenFromHeader || !csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
      console.warn(`Invalid CSRF token for ${request.method} ${pathname}`);
      return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Set CSRF token on the response if it doesn't exist on the request
  if (!request.cookies.has('csrf_token')) {
    const token = randomBytes(32).toString('hex');
    response.cookies.set({
      name: 'csrf_token',
      value: token,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Must be readable by client JS for this pattern
    });
  }
  
  // Authentication and Authorization
  const sessionCookie = request.cookies.get('user_session');
  let user = null;
  if (sessionCookie?.value) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch (e) {
      console.error('Failed to parse session cookie', e);
      const loginUrl = new URL('/login', request.url);
      const clearCookieResponse = NextResponse.redirect(loginUrl);
      clearCookieResponse.cookies.delete('user_session');
      return clearCookieResponse;
    }
  }

  const redirectToLogin = () => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  };
  
  const isPrivilegedUser = user && ['admin', 'vendor', 'delivery'].includes(user.role);

  if (isPrivilegedUser && (pathname.startsWith('/cart') || pathname.startsWith('/checkout'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/admin') && (!user || user.role !== 'admin')) return redirectToLogin();
  if (pathname.startsWith('/vendor') && (!user || user.role !== 'vendor')) return redirectToLogin();
  if (pathname.startsWith('/delivery') && (!user || user.role !== 'delivery')) return redirectToLogin();
  if ((pathname.startsWith('/checkout') || pathname.startsWith('/account')) && !user) return redirectToLogin();

  return response;
}

export const config = {
  // Match all paths except static files and images. This now includes API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
