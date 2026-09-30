"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { InquiryStatus } from "@/generated/prisma";
import { inquiryStatusValues } from "@/lib/inquiries";
import { hasPermission, type UserRole, type Permission } from "@/lib/auth/permissions";

/**
 * Server action updating the status of a customer inquiry.
 *
 * Mirrors the product actions: the session is re-authenticated and permissions
 * re-checked here (the layout gate is not the security boundary), and the
 * status value is constrained to the InquiryStatus enum — arbitrary strings
 * are rejected by Zod before any database write happens.
 */

export interface UpdateInquiryStatusState {
  ok: boolean;
  message: string;
}

const updateInquiryStatusSchema = z.object({
  inquiryId: z.string().trim().min(1).max(100),
  status: z.enum(inquiryStatusValues as [InquiryStatus, ...InquiryStatus[]]),
});

export type UpdateInquiryStatusActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

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

export async function updateInquiryStatusAction(
  _prevState: UpdateInquiryStatusActionResult | undefined,
  formData: FormData
): Promise<UpdateInquiryStatusActionResult> {
  if (!(await requirePermission("orders:status"))) {
    return {
      ok: false,
      message:
        "You are not authorized to manage inquiries. Please sign in again and retry.",
    };
  }

  const parsed = updateInquiryStatusSchema.safeParse({
    inquiryId: formData.get("inquiryId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please choose one of the valid statuses and try again.",
    };
  }

  const { inquiryId, status } = parsed.data;

  try {
    const result = await db.inquiry.updateMany({
      where: { id: inquiryId },
      data: { status, updatedAt: new Date() },
    });

    if (result.count === 0) {
      return {
        ok: false,
        message: "This inquiry no longer exists. It may have been removed.",
      };
    }
  } catch (error) {
    console.error("Failed to update inquiry status", error);
    return {
      ok: false,
      message: "Something went wrong while updating this inquiry. Please try again.",
    };
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  redirect(`/admin/inquiries/${inquiryId}?updated=1`);
}