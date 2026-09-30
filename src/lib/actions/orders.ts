"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderDeleteSchema } from "@/lib/validators/order";
import { hasPermission, type UserRole, type Permission } from "@/lib/auth/permissions";

export type OrderActionState =
  | { status: "success"; message: string }
  | { status: "error"; message: string }
  | undefined;

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

function unauthorizedState(): OrderActionState {
  return {
    status: "error",
    message: "You are not authorized to manage orders. Please sign in again and retry.",
  };
}

function genericFailureState(): OrderActionState {
  return {
    status: "error",
    message: "Something went wrong while deleting this order. Please try again.",
  };
}

export async function deleteOrderAction(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  if (!(await requirePermission("orders:delete"))) return unauthorizedState();

  const parsed = orderDeleteSchema.safeParse({
    orderId: formData.get("orderId"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Missing order ID." };
  }

  try {
    const existing = await db.inquiry.findUnique({
      where: { id: parsed.data.orderId },
      select: { id: true },
    });
    if (!existing) {
      return {
        status: "error",
        message: "This order no longer exists. It may have been deleted already.",
      };
    }

    await db.inquiry.delete({ where: { id: parsed.data.orderId } });
  } catch (error) {
    console.error("Failed to delete order", error);
    return genericFailureState();
  }

  revalidatePath("/admin/orders");
  redirect("/admin/orders?deleted=1");
}