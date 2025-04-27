import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";
import dbConnect from "./lib/dbConnect";
import User from "./lib/models/User";
import { redirect } from "next/navigation";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
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
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          return null;
        }
        
        const isPasswordValid = await user.comparePassword(credentials.password);
        
        if (!isPasswordValid) {
          return null;
        }
        
        return {
          id: user._id.toString(),
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
        token.username = user.username;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // If the url is an absolute URL that starts with the base URL
      if (url.startsWith(baseUrl)) {
        // If it's any auth related URL, redirect to smart-contracts after auth
        if (
          url.includes('/api/auth/signin') || 
          url.includes('/api/auth/callback') ||
          url.includes('/api/auth/error')
        ) {
          return `${baseUrl}/smart-contracts`;
        }
        // If it's already a valid internal URL, don't modify it
        return url;
      }
      
      // If it's an absolute URL to an external site, allow it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // Default redirect to the base URL
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
};
