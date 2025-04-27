import NextAuth from 'next-auth';
import authConfig from './auth.config';

// Define routes configuration
const DEFAULT_LOGIN_REDIRECT = '/smart-contracts';
const apiAuthPrefix = '/api/auth';
const authRoutes = ['/auth'];
const publicRoutes = ['/', '/about', '/pricing', '/contact', '/blog'];

export default NextAuth(authConfig).auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) {
		return;
	}
	if (isAuthRoute) {
		if (isLoggedIn) {
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
		}
		return;
	}
	if (!isLoggedIn && !isPublicRoute) {
		let callbackUrl = nextUrl.pathname;
		if (nextUrl.search) callbackUrl += `?${nextUrl.search}`;
		const encodedCallbackUrl = encodeURIComponent(callbackUrl);
		return Response.redirect(new URL(`/auth?callbackUrl=${encodedCallbackUrl}`, nextUrl));
	}
	return;
});

// Configure middleware matchers
export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
