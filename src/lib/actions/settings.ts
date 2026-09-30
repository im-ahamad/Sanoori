"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, type UserRole, type Permission } from "@/lib/auth/permissions";

export type UpdatePasswordActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

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

function requirePermission(permission: Permission): Promise<boolean> {
  return getUserPermissions().then((user) => {
    if (!user) return false;
    return hasPermission(user.role, user.permissions, permission);
  });
}

export async function updatePasswordAction(
  _prevState: UpdatePasswordActionResult | undefined,
  formData: FormData
): Promise<UpdatePasswordActionResult> {
  if (!(await requirePermission("settings:write"))) {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = updatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  try {
    const session = await auth();
    if (!session?.user) return { ok: false, message: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true, isActive: true, role: true },
    });

    if (!user) {
      return { ok: false, message: "User not found" };
    }

    if (!user.isActive) {
      return { ok: false, message: "Unauthorized" };
    }

    const currentPasswordMatches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash
    );

    if (!currentPasswordMatches) {
      return { ok: false, message: "Current password is incorrect" };
    }

    const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return { ok: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Failed to update password", error);
    return { ok: false, message: "Something went wrong while updating the password" };
  }
}