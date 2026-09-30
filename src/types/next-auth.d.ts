import "next-auth";
import "next-auth/jwt";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "JUNIOR_ADMIN" | "STAFF";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
  }
}