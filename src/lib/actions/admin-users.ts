"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { createAndSendOTP } from "@/lib/actions/admin-verification";
import { type UserRole, type Permission, ALL_PERMISSIONS } from "@/lib/auth/permissions";

export type AdminUserActionState =
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | undefined;

const BCRYPT_ROUNDS = 12;

const INITIAL_FIELD_ERRORS: Record<string, string[]> = {};

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

function unauthorizedState(): AdminUserActionState {
  return {
    status: "error",
    message: "You are not authorized to manage admin users. Please sign in again and retry.",
  };
}

function genericFailureState(message = "Something went wrong. Please try again."): AdminUserActionState {
  return {
    status: "error",
    message,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

const allowedCreateRoles = ["ADMIN", "JUNIOR_ADMIN", "STAFF"] as const;
const allowedUpdateRoles = ["ADMIN", "JUNIOR_ADMIN", "STAFF"] as const;
const MAIN_ADMIN_EMAIL = "sanoori.trading@gmail.com";

function parsePermissions(permissionsString: string | null | undefined): Permission[] {
  if (!permissionsString) return [];
  const parts = permissionsString.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.filter((p): p is Permission => ALL_PERMISSIONS.includes(p as Permission));
}

const createAdminSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters").max(200),
  role: z.enum(allowedCreateRoles).default("ADMIN"),
  permissions: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const updateAdminSchema = z.object({
  adminId: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(200),
  isActive: z.boolean(),
  role: z.enum(allowedUpdateRoles),
  permissions: z.string().optional(),
});

const deleteAdminSchema = z.object({
  adminId: z.string().trim().min(1).max(100),
});

export async function createAdminAction(
  _prevState: AdminUserActionState,
  formData: FormData
): Promise<AdminUserActionState> {
  if (!(await requireSuperAdmin())) return unauthorizedState();

  const parsed = createAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    permissions: formData.get("permissions"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: flattened.fieldErrors ?? INITIAL_FIELD_ERRORS,
    };
  }

  const input = parsed.data;
  const permissions = parsePermissions(input.permissions);

  try {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const created = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        isActive: false,
        emailVerified: false,
        permissions: permissions.length > 0 ? permissions : [],
      },
      select: { id: true, name: true, email: true },
    });

    const otpResult = await createAndSendOTP(created.email, created.name);
    if (!otpResult || otpResult.status === "error") {
      await db.user.delete({ where: { id: created.id } }).catch(() => {});
      return {
        status: "error",
        message: otpResult?.message ?? "Failed to send verification email. Admin not created.",
      };
    }

    revalidatePath("/admin/admin-users");
    redirect("/admin/admin-users?created=1&verification=pending");
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message: "An admin with this email already exists.",
        fieldErrors: { email: ["This email is already in use by another admin."] },
      };
    }
    console.error("Failed to create admin", error);
    return genericFailureState();
  }
}

export async function updateAdminAction(
  _prevState: AdminUserActionState,
  formData: FormData
): Promise<AdminUserActionState> {
  if (!(await requireSuperAdmin())) return unauthorizedState();

  const parsed = updateAdminSchema.safeParse({
    adminId: formData.get("adminId"),
    name: formData.get("name"),
    email: formData.get("email"),
    isActive: formData.get("isActive") === "on",
    role: formData.get("role"),
    permissions: formData.get("permissions"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: flattened.fieldErrors ?? INITIAL_FIELD_ERRORS,
    };
  }

  const input = parsed.data;
  const permissions = parsePermissions(input.permissions);

  try {
    const existing = await db.user.findUnique({
      where: { id: input.adminId },
      select: { id: true, email: true, isActive: true, role: true },
    });

    if (!existing) {
      return { status: "error", message: "This admin no longer exists." };
    }

    if (existing.email === MAIN_ADMIN_EMAIL && input.role !== existing.role) {
      return {
        status: "error",
        message: "The main administrator role cannot be changed.",
        fieldErrors: { role: ["The main administrator role cannot be changed."] },
      };
    }

    if (existing.email !== input.email) {
      const emailTaken = await db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (emailTaken) {
        return {
          status: "error",
          message: "An admin with this email already exists.",
          fieldErrors: { email: ["This email is already in use by another admin."] },
        };
      }
    }

    const activeAdmins = await db.user.count({
      where: { isActive: true, role: "ADMIN" },
    });

    if (activeAdmins <= 1 && existing.isActive && !input.isActive) {
      return {
        status: "error",
        message: "Cannot deactivate the last active admin account.",
      };
    }

    if (existing.email === MAIN_ADMIN_EMAIL && !input.isActive) {
      return {
        status: "error",
        message: "The main administrator account cannot be deactivated.",
      };
    }

    const session = await auth();
    const currentUserId = session?.user?.id;

    if (currentUserId === input.adminId && !input.isActive) {
      return {
        status: "error",
        message: "You cannot deactivate your own account.",
      };
    }

    await db.user.update({
      where: { id: input.adminId },
      data: {
        name: input.name,
        email: input.email,
        isActive: input.isActive,
        role: input.role,
        permissions: permissions.length > 0 ? permissions : [],
      },
    });

    revalidatePath("/admin/admin-users");
    redirect("/admin/admin-users?updated=1");
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message: "An admin with this email already exists.",
        fieldErrors: { email: ["This email is already in use by another admin."] },
      };
    }
    console.error("Failed to update admin", error);
    return genericFailureState();
  }
}

export async function deleteAdminAction(
  _prevState: AdminUserActionState,
  formData: FormData
): Promise<AdminUserActionState> {
  if (!(await requireSuperAdmin())) return unauthorizedState();

  const parsed = deleteAdminSchema.safeParse({
    adminId: formData.get("adminId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Missing admin ID." };
  }

  const input = parsed.data;

  try {
    const existing = await db.user.findUnique({
      where: { id: input.adminId },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (!existing) {
      return {
        status: "error",
        message: "This admin no longer exists. It may have been deleted already.",
      };
    }

    if (existing.email === MAIN_ADMIN_EMAIL) {
      return {
        status: "error",
        message: "The main administrator account cannot be deleted.",
      };
    }

    const session = await auth();
    const currentUserId = session?.user?.id;

    if (currentUserId === input.adminId) {
      return { status: "error", message: "You cannot delete your own account." };
    }

    const activeAdmins = await db.user.count({
      where: { isActive: true, role: "ADMIN" },
    });

    if (activeAdmins <= 1 && existing.isActive) {
      return {
        status: "error",
        message: "Cannot delete the last active admin account.",
      };
    }

    await db.user.delete({ where: { id: input.adminId } });
  } catch (error) {
    console.error("Failed to delete admin", error);
    return genericFailureState();
  }

  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users?deleted=1");
}