// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb"; // correct — server-only mongo client
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const client = await clientPromise;
        const db = client.db();
        // NOTE: adapter stores users in collection users by default,
        // but depending on adapter/migration you might have nextauth_users.
        // Adjust collection name if needed.
        const user = await db
          .collection("nextauth_users")
          .findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && token.sub) (session.user as any).id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/signup", // your custom sign-in page
  },
};

export default NextAuth(authOptions);
