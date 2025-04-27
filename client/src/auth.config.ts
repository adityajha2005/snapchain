import GitHub from 'next-auth/providers/github';
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

// Notice this is only an object, not a full Auth.js instance
export default {
	pages: {
		signIn: '/auth',
	},
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			allowDangerousEmailAccountLinking: true,
		}),
		GitHub({
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			allowDangerousEmailAccountLinking: true,
		}),
	],
} satisfies NextAuthConfig;
