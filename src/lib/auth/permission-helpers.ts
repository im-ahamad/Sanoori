import "server-only";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  type UserRole,
  type Permission,
  hasPermission,
  getDefaultPermissionsForRole,
} from "@/lib/auth/permissions";

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export function checkPermission(
  userRole: UserRole | undefined,
  userPermissions: unknown,
  userIsActive: boolean,
  requiredPermission: Permission
): PermissionCheckResult {
  if (!userRole) {
    return { allowed: false, reason: "Unauthenticated" };
  }

  if (!userIsActive) {
    return { allowed: false, reason: "Account inactive" };
  }

  if (hasPermission(userRole, userPermissions, requiredPermission)) {
    return { allowed: true };
  }

  return { allowed: false, reason: `Missing permission: ${requiredPermission}` };
}

export async function requirePermission(permission: Permission): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    redirect("/secure-admin");
  }

  const user = await getUserWithPermissions(session.user.id);

  if (!user) {
    redirect("/secure-admin");
  }

  if (!user.isActive) {
    redirect("/secure-admin");
  }

  const result = checkPermission(user.role, user.permissions, user.isActive, permission);

  if (!result.allowed) {
    redirect("/secure-admin");
  }
}

async function getUserWithPermissions(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      permissions: true,
      isActive: true,
    },
  });
}

export async function getCurrentUserPermissions(): Promise<{
  role: UserRole | null;
  permissions: Permission[];
  isActive: boolean;
} | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = await getUserWithPermissions(session.user.id);

  if (!user) {
    return null;
  }

  const explicitPermissions = getUserExplicitPermissions(user.permissions);
  const rolePermissions = getDefaultPermissionsForRole(user.role);
  const allPermissions = [...new Set([...explicitPermissions, ...rolePermissions])].filter(
    (p): p is Permission => p !== "*"
  );

  return {
    role: user.role,
    permissions: allPermissions,
    isActive: user.isActive,
  };
}

function getUserExplicitPermissions(permissions: unknown): (Permission | "*")[] {
  if (!permissions || !Array.isArray(permissions)) {
    return [];
  }
  return permissions.filter((p): p is Permission | "*" =>
    typeof p === "string" && (p === "*" || p !== "*")
  );
}