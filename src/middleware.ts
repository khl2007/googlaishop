import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // This is a mock authentication check. In a real app, you'd verify a JWT or session.
    const isAdminAuthenticated = request.cookies.get('admin_token')?.value === 'true';

    if (!isAdminAuthenticated) {
      // If not authenticated, redirect to a login page.
      // You might want to pass the intended destination as a query param.
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths starting with `/admin`.
  matcher: '/admin/:path*',
};
