import "server-only";

import { db } from "@/lib/db";

export const ADMIN_USERS_PAGE_SIZE = 20;

export type AdminUsersResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface AdminUserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminUserList {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminUserDetail {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export type AdminUserDetailResult =
  | { ok: true; data: AdminUserDetail }
  | { ok: false; error: "database" | "not-found" };

export async function listAdminUsers(): Promise<AdminUsersResult<AdminUserList>> {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const items: AdminUserListItem[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return {
      ok: true,
      data: {
        items,
        page: 1,
        pageSize: ADMIN_USERS_PAGE_SIZE,
        total: items.length,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error("Failed to list admin users", error);
    return { ok: false, error: "database" };
  }
}

export async function getAdminUserDetail(
  id: string
): Promise<AdminUserDetailResult> {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { ok: false, error: "not-found" };
    }

    return {
      ok: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error("Failed to load admin user detail", error);
    return { ok: false, error: "database" };
  }
}

export async function countActiveAdmins(): Promise<number> {
  try {
    return await db.user.count({
      where: { isActive: true, role: "ADMIN" },
    });
  } catch {
    return 0;
  }
}