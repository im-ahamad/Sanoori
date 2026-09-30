"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type LoginActionState = {
  error?: string;
} | undefined;

/**
 * Server action backing the admin login form.
 *
 * Successful sign-in redirects to /admin (the redirect is thrown by Auth.js).
 * On failure it returns a user-friendly message — no technical details, no
 * stack traces, and passwords are never logged.
 */
export async function authenticate(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

/** Signs the current admin out and returns them to the login page. */
export async function logoutAction() {
  await signOut({ redirectTo: "/secure-admin" });
}