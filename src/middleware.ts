import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('user_session');

  let user = null;
  if (sessionCookie?.value) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch (e) {
      // Corrupted cookie, treat as logged out
      console.error('Failed to parse session cookie', e);
      const response = NextResponse.next();
      response.cookies.delete('user_session'); // Clear the corrupted cookie
      return response;
    }
  }

  const redirectToLogin = () => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  };

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


  return NextResponse.next();
}

export const config = {
  // Match all paths starting with the specified prefixes.
  matcher: ['/admin/:path*', '/vendor/:path*', '/delivery/:path*'],
};
