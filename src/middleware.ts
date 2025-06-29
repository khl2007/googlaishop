import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  const sessionCookie = request.cookies.get('user_session');

  let user = null;
  if (sessionCookie?.value) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch (e) {
      // Corrupted cookie, treat as logged out
      console.error('Failed to parse session cookie', e);
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      response.cookies.delete('user_session'); // Clear the corrupted cookie
      return response;
    }
  }

  const redirectToLogin = () => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  };
  
  const isPrivilegedUser = user && ['admin', 'vendor', 'delivery'].includes(user.role);

  // Prevent admin, vendor, or delivery from accessing cart and checkout
  if (isPrivilegedUser && (pathname.startsWith('/cart') || pathname.startsWith('/checkout'))) {
      return NextResponse.redirect(new URL('/', request.url));
  }


  if (pathname.startsWith('/admin')) {
    if (!user || user.role !== 'admin') {
      return redirectToLogin();
    }
  }

  if (pathname.startsWith('/vendor')) {
    if (!user || user.role !== 'vendor') {
      return redirectToLogin();
    }
  }
  
  if (pathname.startsWith('/delivery')) {
    if (!user || user.role !== 'delivery') {
      return redirectToLogin();
    }
  }

  if (pathname.startsWith('/checkout')) {
    if (!user) {
      return redirectToLogin();
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // We need to match all paths to make the pathname available everywhere,
  // but we should exclude static assets and API routes to avoid unnecessary processing.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
