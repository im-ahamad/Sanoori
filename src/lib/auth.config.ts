import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible Auth.js configuration.
 *
 * This file intentionally imports NO database code. It is the only Auth.js
 * config that the edge runtime (src/proxy.ts) sees. The database-backed
 * Credentials provider lives in src/lib/auth.ts and only ever runs on the
 * Node.js runtime inside the `/api/auth` route handler.
 */
export const authConfig = {
  pages: {
    signIn: "/secure-admin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "ADMIN";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;