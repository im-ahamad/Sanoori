"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type UpdatePasswordActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

export async function updatePasswordAction(
  _prevState: UpdatePasswordActionResult | undefined,
  formData: FormData
): Promise<UpdatePasswordActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
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
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { ok: false, message: "User not found" };
    }

    // In a real implementation, you'd use bcrypt here
    // For now, we'll just return not implemented
    return { ok: false, message: "Password change not yet implemented" };
  } catch (error) {
    console.error("Failed to update password", error);
    return { ok: false, message: "Something went wrong while updating the password" };
  }
}