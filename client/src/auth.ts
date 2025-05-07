import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter } from "next-auth/adapters";
import clientPromise from "./lib/mongodb";
import dbConnect from "./lib/dbConnect";
import User, { IUser } from "./lib/models/User";
import { redirect } from "next/navigation";
import { Types } from 'mongoose';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"]
  }

  interface User {
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        await dbConnect();
        
        // Get the user document for password comparison
        const userDoc = await User.findOne({ email: credentials.email }) as IUser;
        if (!userDoc) {
          return null;
        }
        
        const isPasswordValid = await userDoc.comparePassword(credentials.password);
        if (!isPasswordValid) {
          return null;
        }
        
        // Get a plain object for auth
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user?._id) {
          return null;
        }

        return {
          id: (user._id as unknown as Types.ObjectId).toString(),
          email: user.email,
          username: user.username,
          github: user.github,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = (user as unknown as { username: string }).username;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        if (
          url.includes('/api/auth/signin') || 
          url.includes('/api/auth/callback') ||
          url.includes('/api/auth/error')
        ) {
          return `${baseUrl}/smart-contracts`;
        }
        return url;
      }
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};