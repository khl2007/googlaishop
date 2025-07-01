
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  // This is the response we will eventually return, unless we error out early.
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isSecure = request.nextUrl.protocol === 'https:';

  // Ensure CSRF cookie is set on the response if it's not in the request.
  // This happens first, so the `response` object has the cookie info.
  if (!request.cookies.has('csrf_token')) {
    const token = crypto.randomUUID();
    response.cookies.set({
      name: 'csrf_token',
      value: token,
      path: '/',
      sameSite: 'none',
      secure: isSecure,
      httpOnly: false, // Must be readable by client JS for this pattern
    });
  }

  // CSRF Protection Check
  const isCsrfExempt = pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register');
  if (STATE_CHANGING_METHODS.includes(request.method) && !isCsrfExempt) {
    const csrfTokenFromHeader = request.headers.get('x-csrf-token');
    const csrfTokenFromCookie = request.cookies.get('csrf_token')?.value;

    if (!csrfTokenFromHeader || !csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
      console.warn(`Invalid CSRF token for ${request.method} ${pathname}`);
      return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
    }
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
    const redirectResponse = NextResponse.redirect(loginUrl);
    
    // **THE FIX**: Copy the CSRF cookie from our main `response` object
    // to the new `redirectResponse` object before returning it.
    const csrfCookie = response.cookies.get('csrf_token');
    if (csrfCookie) {
        redirectResponse.cookies.set(csrfCookie);
    }
    
    return redirectResponse;
  };
  
  const isPrivilegedUser = user && ['admin', 'vendor', 'delivery'].includes(user.role);

  if (isPrivilegedUser && (pathname.startsWith('/cart') || pathname.startsWith('/checkout'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/admin') && (!user || user.role !== 'admin')) return redirectToLogin();
  if (pathname.startsWith('/vendor') && (!user || user.role !== 'vendor')) return redirectToLogin();
  if (pathname.startsWith('/delivery') && (!user || user.role !== 'delivery')) return redirectToLogin();
  if ((pathname.startsWith('/checkout') || pathname.startsWith('/account')) && !user) return redirectToLogin();

  // If we reach here, no redirect was needed, so we return the original `response`.
  return response;
}

export const config = {
  // Match all paths except static files and images. This now includes API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
