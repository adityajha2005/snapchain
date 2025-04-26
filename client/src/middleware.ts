import NextAuth from 'next-auth'
import { NextResponse } from 'next/server';
import authConfig from './auth.config';

// Define public paths that don't require authentication
const PUBLIC_PATHS = ['/auth', '/', '/about', '/pricing', '/contact', '/blog'];

export default NextAuth(authConfig).auth((req)=> {
  const isLoggedIn = !!req.auth;
	const { pathname } = req.nextUrl;

	const isPublicPath = PUBLIC_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`)
	);

	// Redirect unauthenticated users to login
	if (!isLoggedIn && !isPublicPath) {
		const loginUrl = new URL('/auth', req.url);
		loginUrl.searchParams.set('callbackUrl', req.url);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users away from auth page
	if (isLoggedIn && pathname === '/auth') {
		return NextResponse.redirect(new URL('/smart-contracts', req.url));
	}

	return NextResponse.next();
}
)
// Configure middleware matchers
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/ai-chat/:path*',
    '/profile/:path*',
    '/contracts/:path*',
    '/(app)/:path*',
    
    // Auth page for redirect handling
    '/auth',
    
    // All pages except static assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
