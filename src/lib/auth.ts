import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { loginCredentialsSchema } from "@/lib/validators/auth";

const validRoles = ["SUPER_ADMIN", "ADMIN", "JUNIOR_ADMIN", "STAFF"] as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        challengeId: { label: "Challenge ID", type: "text" },
      },
      authorize: async (credentials) => {
        // Path 1: Challenge-based authentication (after OTP verification)
        if (credentials?.challengeId) {
          const challengeId = credentials.challengeId as string;

          // Atomic claim: only succeed if verifiedAt exists AND sessionIssuedAt is null
          const challenge = await db.loginChallenge.findUnique({
            where: { id: challengeId },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  isActive: true,
                  emailVerified: true,
                },
              },
            },
          });

          if (!challenge) return null;
          if (!challenge.verifiedAt) return null; // OTP not verified
          if (challenge.sessionIssuedAt) return null; // Session already issued
          if (challenge.expiresAt < new Date()) return null; // Expired

          const user = challenge.user;
          if (!user || !user.isActive) return null;
          if (!validRoles.includes(user.role)) return null;
          if (!user.emailVerified) return null;

          // Atomic claim - set sessionIssuedAt only if still null
          const claimed = await db.loginChallenge.update({
            where: {
              id: challengeId,
              sessionIssuedAt: null, // Only update if not already issued
            },
            data: {
              sessionIssuedAt: new Date(),
            },
          });

          if (!claimed) return null; // Race condition - another request claimed it

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        // Path 2: Password-only authentication - REJECTED for admin login
        // This prevents direct password-only login bypassing OTP
        return null;
      },
    }),
  ],
});