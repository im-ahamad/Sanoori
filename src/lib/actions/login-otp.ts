"use server";

import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/mailer";
import { Prisma } from "@/generated/prisma/client";
import { loginCredentialsSchema } from "@/lib/validators/auth";

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export type LoginOtpActionState =
  | { status: "success"; message: string; challengeId?: string }
  | { status: "error"; message: string }
  | undefined;

function genericError(message: string): LoginOtpActionState {
  return { status: "error", message };
}

function genericSuccess(message: string, challengeId?: string): LoginOtpActionState {
  return { status: "success", message, challengeId };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
}

function buildLoginOTPEmail(otp: string, userName: string | null): { html: string; text: string } {
  const name = userName ?? "Admin";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px 48px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <img src="https://sanooritrading.com/images/logo.svg" alt="Sanoori Trading" width="180" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">Admin Login Verification</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">Hello ${name},</p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">You are attempting to sign in to the Sanoori Trading Admin panel. Please use the verification code below to complete your login.</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 32px 0; background-color: #f9fafb; border-radius: 8px;">
              <div style="display: inline-block; background-color: #111827; color: #ffffff; padding: 16px 40px; border-radius: 8px; letter-spacing: 8px; font-size: 32px; font-weight: 700; font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;">
                ${otp}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #6b7280;">This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #6b7280;">You have a maximum of <strong>${MAX_ATTEMPTS} attempts</strong> to enter the correct code.</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ef4444; font-weight: 500;">⚠ Do not share this code with anyone. Sanoori Trading will never ask for your verification code.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">If you did not request this login, please secure your account immediately.</p>
              <p style="margin: 8px 0 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">— The Sanoori Trading Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
Sanoori Trading — Admin Login Verification Code

Hello ${name},

You are attempting to sign in to the Sanoori Trading Admin panel. Please use the verification code below to complete your login.

Verification Code: ${otp}

This code expires in ${OTP_EXPIRY_MINUTES} minutes.
You have a maximum of ${MAX_ATTEMPTS} attempts to enter the correct code.

⚠ Do not share this code with anyone. Sanoori Trading will never ask for your verification code.

If you did not request this login, please secure your account immediately.

— The Sanoori Trading Team
`;

  return { html, text };
}

export async function verifyPasswordOnly(
  _prevState: LoginOtpActionState,
  formData: FormData
): Promise<LoginOtpActionState> {
  const parsed = loginCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return genericError("Invalid email or password.");
  }

  const { email, password } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return genericError("Invalid email or password.");
    }

    if (!user.isActive) {
      return genericError("Invalid email or password.");
    }

    const validRoles = ["SUPER_ADMIN", "ADMIN", "JUNIOR_ADMIN", "STAFF"];
    if (!validRoles.includes(user.role)) {
      return genericError("Invalid email or password.");
    }

    if (!user.emailVerified) {
      return genericError("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return genericError("Invalid email or password.");
    }

    // Password verified - create login challenge
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    try {
      await db.loginChallenge.create({
        data: {
          userId: user.id,
          otpHash,
          expiresAt,
          attempts: 0,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        // Shouldn't happen with cuid, but handle gracefully
        return genericError("A login attempt is already in progress. Please try again.");
      }
      console.error("Failed to create login challenge:", error);
      return genericError("Failed to initiate login. Please try again.");
    }

    const { html, text } = buildLoginOTPEmail(otp, user.name);
    const result = await sendEmail({
      to: user.email,
      subject: "Sanoori Trading — Your Login Verification Code",
      html,
      text,
    });

    if (!result.success) {
      await db.loginChallenge.deleteMany({ where: { userId: user.id } }).catch(() => {});
      return genericError(`Failed to send verification email: ${result.error}`);
    }

    // Get the challenge we just created to return its ID
    const challenge = await db.loginChallenge.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    return genericSuccess("Verification code sent. Please check your email.", challenge?.id);
  } catch (error) {
    console.error("Failed to verify password:", error);
    return genericError("Something went wrong. Please try again.");
  }
}

const verifyLoginOtpSchema = z.object({
  challengeId: z.string().cuid("Invalid challenge ID"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export async function verifyLoginOtp(
  _prevState: LoginOtpActionState,
  formData: FormData
): Promise<LoginOtpActionState> {
  const parsed = verifyLoginOtpSchema.safeParse({
    challengeId: formData.get("challengeId"),
    otp: formData.get("otp"),
  });

  if (!parsed.success) {
    return genericError("Invalid input. Please enter a 6-digit code.");
  }

  const { challengeId, otp } = parsed.data;

  try {
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

    if (!challenge) {
      return genericError("Invalid or expired login attempt. Please start over.");
    }

    if (challenge.expiresAt < new Date()) {
      await db.loginChallenge.delete({ where: { id: challengeId } }).catch(() => {});
      return genericError("Login attempt has expired. Please sign in again.");
    }

    if (challenge.verifiedAt) {
      return genericError("This login attempt has already been used. Please sign in again.");
    }

    if (challenge.attempts >= MAX_ATTEMPTS) {
      await db.loginChallenge.delete({ where: { id: challengeId } }).catch(() => {});
      return genericError("Too many failed attempts. Please sign in again.");
    }

    const isValid = await bcrypt.compare(otp, challenge.otpHash);

    if (!isValid) {
      await db.loginChallenge.update({
        where: { id: challengeId },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_ATTEMPTS - challenge.attempts - 1;
      return genericError(`Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
    }

    // OTP verified - mark as verified
    await db.loginChallenge.update({
      where: { id: challengeId },
      data: { verifiedAt: new Date() },
    });

    // Re-validate user state
    const user = challenge.user;
    if (!user || !user.isActive) {
      return genericError("Account is no longer active. Please contact an administrator.");
    }

    const validRoles = ["SUPER_ADMIN", "ADMIN", "JUNIOR_ADMIN", "STAFF"];
    if (!validRoles.includes(user.role)) {
      return genericError("Invalid account role. Please contact an administrator.");
    }

    if (!user.emailVerified) {
      return genericError("Email not verified. Please contact an administrator.");
    }

    return genericSuccess("Verification successful. Redirecting...", challengeId);
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    return genericError("Something went wrong. Please try again.");
  }
}

const resendLoginOtpSchema = z.object({
  challengeId: z.string().cuid("Invalid challenge ID"),
});

export async function resendLoginOtp(
  _prevState: LoginOtpActionState,
  formData: FormData
): Promise<LoginOtpActionState> {
  const parsed = resendLoginOtpSchema.safeParse({
    challengeId: formData.get("challengeId"),
  });

  if (!parsed.success) {
    return genericError("Invalid request.");
  }

  const { challengeId } = parsed.data;

  try {
    const challenge = await db.loginChallenge.findUnique({
      where: { id: challengeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!challenge) {
      return genericError("Invalid or expired login attempt. Please sign in again.");
    }

    if (challenge.expiresAt < new Date()) {
      await db.loginChallenge.delete({ where: { id: challengeId } }).catch(() => {});
      return genericError("Login attempt has expired. Please sign in again.");
    }

    if (challenge.verifiedAt) {
      return genericError("This login attempt has already been verified. Please sign in again.");
    }

    if (!challenge.user || !challenge.user.isActive) {
      return genericError("Account is no longer active. Please contact an administrator.");
    }

    // Check resend cooldown
    const cooldownEnd = new Date(challenge.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000);
    if (cooldownEnd > new Date()) {
      const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
      return genericError(`Please wait ${remaining} second${remaining === 1 ? "" : "s"} before requesting a new code.`);
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.loginChallenge.update({
      where: { id: challengeId },
      data: {
        otpHash,
        expiresAt,
        attempts: 0,
        createdAt: new Date(), // Reset cooldown timer
      },
    });

    const { html, text } = buildLoginOTPEmail(otp, challenge.user.name);
    const result = await sendEmail({
      to: challenge.user.email,
      subject: "Sanoori Trading — Your Login Verification Code",
      html,
      text,
    });

    if (!result.success) {
      return genericError(`Failed to send verification email: ${result.error}`);
    }

    return genericSuccess("New verification code sent. Please check your email.");
  } catch (error) {
    console.error("Failed to resend OTP:", error);
    return genericError("Something went wrong. Please try again.");
  }
}