"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

/**
 * Server action for admin sign-in with email and password.
 * On success, redirects to /admin.
 * On failure, returns an error message.
 */
export async function signInAction(
  _prevState: { error?: string; redirectTo?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; redirectTo?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    // `redirect: false` prevents Auth.js from using AUTH_URL (env var) to
    // build the redirect destination. We return the redirect target instead of
    // calling next/navigation's redirect() directly, because useActionState
    // intercepts the NEXT_REDIRECT throw and prevents browser navigation.
    // The client handles navigation via useEffect + useRouter.
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
      redirect: false,
    });
    return { redirectTo: `${siteConfig.url}/admin` };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

/** Signs the current admin out and returns them to the login page. */
export async function logoutAction() {
  // `redirect: false` prevents Auth.js from using AUTH_URL (env var) to
  // build the redirect destination. Cookies are still cleared by signOut.
  await signOut({ redirect: false, redirectTo: "/secure-admin" });
  redirect(`${siteConfig.url}/secure-admin`);
}