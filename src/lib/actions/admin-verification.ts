"use server";

import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail, sendAdminNotificationEmail } from "@/lib/email/mailer";
import { Prisma } from "@/generated/prisma/client";
import { type UserRole } from "@/lib/auth/permissions";

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export type VerificationActionState =
  | { status: "success"; message: string }
  | { status: "error"; message: string }
  | undefined;

function genericError(message: string): VerificationActionState {
  return { status: "error", message };
}

function genericSuccess(message: string): VerificationActionState {
  return { status: "success", message };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

async function getUserPermissions(): Promise<{ role: UserRole; permissions: unknown } | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, permissions: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return { role: user.role as UserRole, permissions: user.permissions };
}

function requireSuperAdmin(): Promise<boolean> {
  return getUserPermissions().then((user) => {
    if (!user) return false;
    return user.role === "SUPER_ADMIN";
  });
}

function unauthorizedState(): VerificationActionState {
  return {
    status: "error",
    message: "Unauthorized. Please sign in again.",
  };
}

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
}

function buildOTPEmail(otp: string, userName: string | null): { html: string; text: string } {
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
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">Verify your email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">Hello ${name},</p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">Welcome to Sanoori Trading Admin. Please use the verification code below to activate your admin account.</p>
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
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">If you did not request this verification, please ignore this email.</p>
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
Sanoori Trading — Admin Email Verification

Hello ${name},

Welcome to Sanoori Trading Admin. Please use the verification code below to activate your admin account.

Verification Code: ${otp}

This code expires in ${OTP_EXPIRY_MINUTES} minutes.
You have a maximum of ${MAX_ATTEMPTS} attempts to enter the correct code.

⚠ Do not share this code with anyone. Sanoori Trading will never ask for your verification code.

If you did not request this verification, please ignore this email.

— The Sanoori Trading Team
`;

  return { html, text };
}

function buildAdminNotificationEmail(
  adminName: string | null,
  adminEmail: string,
  role: string
): { html: string; text: string } {
  const name = adminName ?? "Admin";
  const verifiedAt = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

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
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">New Admin Verified</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">A new administrator has successfully verified their email and is now active.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; background-color: #f9fafb; border-radius: 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 12px; font-weight: 600; color: #374151; width: 160px;">Admin Name:</td>
                  <td style="padding-bottom: 12px; color: #111827;">${name}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-weight: 600; color: #374151;">Email:</td>
                  <td style="padding-bottom: 12px; color: #111827;">${adminEmail}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-weight: 600; color: #374151;">Role:</td>
                  <td style="padding-bottom: 12px; color: #111827;">${role}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-weight: 600; color: #374151;">Verification Status:</td>
                  <td style="padding-bottom: 12px; color: #059669; font-weight: 600;">Verified</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-weight: 600; color: #374151;">Account Status:</td>
                  <td style="padding-bottom: 12px; color: #059669; font-weight: 600;">Active</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #374151;">Verified At:</td>
                  <td style="color: #111827;">${verifiedAt}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #6b7280;">The admin has completed email verification and can now access the Sanoori Trading Admin dashboard.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">— The Sanoori Trading System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
Sanoori Trading — New Admin Verified

A new administrator has successfully verified their email and is now active.

Admin Name: ${name}
Email: ${adminEmail}
Role: ${role}
Verification Status: Verified
Account Status: Active
Verified At: ${verifiedAt}

The admin has completed email verification and can now access the Sanoori Trading Admin dashboard.

— The Sanoori Trading System
`;

  return { html, text };
}

export async function createAndSendOTP(
  email: string,
  userName: string | null
): Promise<VerificationActionState> {
  if (!(await requireSuperAdmin())) return unauthorizedState();

  try {
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    try {
      await db.adminVerification.upsert({
        where: { email },
        create: {
          email,
          otpHash,
          expiresAt,
          attempts: 0,
        },
        update: {
          otpHash,
          expiresAt,
          attempts: 0,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return genericError("A verification record already exists for this email. Please try again.");
      }
      console.error("Failed to save OTP:", error);
      return genericError("Failed to generate verification code. Please try again.");
    }

    const { html, text } = buildOTPEmail(otp, userName);
    const result = await sendEmail({
      to: email,
      subject: "Sanoori Trading — Verify your admin email",
      html,
      text,
    });

    if (!result.success) {
      await db.adminVerification.delete({ where: { email } }).catch(() => {});
      return genericError(`Failed to send verification email: ${result.error}`);
    }

    return genericSuccess("Verification code sent successfully. Please check your email.");
  } catch (error) {
    console.error("Failed to create and send OTP:", error);
    return genericError("Something went wrong. Please try again.");
  }
}

const verifyOTPSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export async function verifyOTP(
  _prevState: VerificationActionState,
  formData: FormData
): Promise<VerificationActionState> {
  const parsed = verifyOTPSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
  });

  if (!parsed.success) {
    return genericError("Invalid input. Please enter a 6-digit code.");
  }

  const { email, otp } = parsed.data;

  try {
    const verification = await db.adminVerification.findUnique({
      where: { email },
    });

    if (!verification) {
      return genericError("No verification code found for this email. Please request a new code.");
    }

    if (verification.expiresAt < new Date()) {
      await db.adminVerification.delete({ where: { email } });
      return genericError("Verification code has expired. Please request a new code.");
    }

    if (verification.attempts >= MAX_ATTEMPTS) {
      await db.adminVerification.delete({ where: { email } });
      return genericError("Too many failed attempts. Please request a new code.");
    }

    const isValid = await bcrypt.compare(otp, verification.otpHash);

    if (!isValid) {
      await db.adminVerification.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_ATTEMPTS - verification.attempts - 1;
      return genericError(`Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { name: true, email: true, role: true },
    });

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { email },
        data: {
          emailVerified: true,
          isActive: true,
        },
      });
      await tx.adminVerification.delete({ where: { email } });
    });

    if (user) {
      const { html, text } = buildAdminNotificationEmail(user.name, user.email, user.role);
      const notificationResult = await sendAdminNotificationEmail(
        "New Admin Email Verified — Sanoori Trading",
        html,
        text
      );
      if (!notificationResult.success) {
        console.error("Failed to send admin notification email:", notificationResult.error);
      }
    }

    return genericSuccess("Email verified successfully! You can now log in.");
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    return genericError("Something went wrong. Please try again.");
  }
}

const resendOTPSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
});

export async function resendOTP(
  _prevState: VerificationActionState,
  formData: FormData
): Promise<VerificationActionState> {
  const parsed = resendOTPSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return genericError("Invalid email.");
  }

  const { email } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true },
    });

    if (!user) {
      return genericError("No admin account found with this email.");
    }

    if (user.emailVerified) {
      return genericError("This email is already verified. You can log in directly.");
    }

    const verification = await db.adminVerification.findUnique({
      where: { email },
    });

    if (verification) {
      const cooldownEnd = new Date(verification.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000);
      if (cooldownEnd > new Date()) {
        const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
        return genericError(`Please wait ${remaining} second${remaining === 1 ? "" : "s"} before requesting a new code.`);
      }
    }

    return await createAndSendOTP(email, user.name);
  } catch (error) {
    console.error("Failed to resend OTP:", error);
    return genericError("Something went wrong. Please try again.");
  }
}