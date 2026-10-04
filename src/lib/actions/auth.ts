"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { verifyPasswordOnly, verifyLoginOtp, type LoginOtpActionState } from "@/lib/actions/login-otp";

/**
 * Stage 1: Password verification result
 */
export type PasswordVerifyState =
  | { stage: "password"; requiresOtp: true; challengeId: string }
  | { stage: "password"; error: string }
  | undefined;

/**
 * Stage 2: OTP verification result
 */
export type OtpVerifyState =
  | { stage: "otp"; success: true; challengeId: string }
  | { stage: "otp"; error: string }
  | undefined;

/**
 * Server action for Stage 1: Verify password and initiate OTP challenge.
 * Returns { requiresOtp: true, challengeId } on success.
 * Returns { error } on failure.
 */
export async function authenticate(
  _prevState: PasswordVerifyState,
  formData: FormData
): Promise<PasswordVerifyState> {
  const result = await verifyPasswordOnly(undefined, formData);

  if (!result) {
    return { stage: "password", error: "Something went wrong. Please try again." };
  }

  if (result.status === "success") {
    return { stage: "password", requiresOtp: true, challengeId: result.challengeId! };
  }

  return { stage: "password", error: result.message };
}

/**
 * Server action for Stage 2: Verify OTP and complete authentication.
 * On success, calls Auth.js signIn with the challengeId to create the session.
 */
export async function verifyOtpAndSignIn(
  _prevState: OtpVerifyState,
  formData: FormData
): Promise<OtpVerifyState> {
  const challengeId = formData.get("challengeId") as string;
  const otp = formData.get("otp") as string;

  if (!challengeId || !otp) {
    return { stage: "otp", error: "Invalid request." };
  }

  const result = await verifyLoginOtp(undefined, (() => {
    const fd = new FormData();
    fd.append("challengeId", challengeId);
    fd.append("otp", otp);
    return fd;
  })());

  if (!result) {
    return { stage: "otp", error: "Something went wrong. Please try again." };
  }

  if (result.status === "error") {
    return { stage: "otp", error: result.message };
  }

  // OTP verified successfully - now create the Auth.js session using challengeId
  try {
    await signIn("credentials", {
      challengeId,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // If session creation fails, the challenge is already consumed (sessionIssuedAt set)
      // but the session wasn't created. This is a rare edge case.
      // We return an error - the user will need to start over.
      return { stage: "otp", error: "Failed to create session. Please sign in again." };
    }
    throw error;
  }

  // signIn throws a redirect on success, so we never reach here
  return { stage: "otp", success: true, challengeId };
}

/** Signs the current admin out and returns them to the login page. */
export async function logoutAction() {
  await signOut({ redirectTo: "/secure-admin" });
}