import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import client from './lib/authDB';
import authConfig from './auth.config';
export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: MongoDBAdapter(client),
	session: {
		strategy: 'jwt',
	},
	...authConfig,
});
