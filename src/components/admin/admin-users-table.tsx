"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import type { AdminUserList } from "@/lib/admin/admin-users";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteAdminDialog } from "@/components/admin/delete-admin-dialog";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

function getRoleBadgeVariant(role: string): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive";
    case "ADMIN":
      return "default";
    case "JUNIOR_ADMIN":
      return "secondary";
    case "STAFF":
      return "outline";
    default:
      return "outline";
  }
}

function getRoleLabel(role: string, t: ReturnType<typeof useAdminTranslations>): string {
  switch (role) {
    case "SUPER_ADMIN":
      return t.common.superAdmin;
    case "ADMIN":
      return t.common.admin;
    case "JUNIOR_ADMIN":
      return t.common.juniorAdmin;
    case "STAFF":
      return t.common.staff;
    default:
      return role;
  }
}

interface AdminUsersTableProps {
  data: AdminUserList;
}

export function AdminUsersTable({ data }: AdminUsersTableProps) {
  const t = useAdminTranslations();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {data.items.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t.common.name}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t.common.email}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    {t.common.adminRole}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t.common.status}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                    {t.common.adminCreated}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((admin) => (
                  <AdminUserRow key={admin.id} admin={admin} t={t} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet cards */}
          <ul className="divide-y divide-border lg:hidden">
            {data.items.map((admin) => (
              <li key={admin.id} className="p-4">
                <AdminUserCard admin={admin} t={t} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

interface AdminUserRowProps {
  admin: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  };
  t: ReturnType<typeof useAdminTranslations>;
}

function AdminUserRow({ admin, t }: AdminUserRowProps) {
  const roleVariant = getRoleBadgeVariant(admin.role);
  const roleLabel = getRoleLabel(admin.role, t);

  return (
    <tr className="align-middle transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <Link
          href={`/admin/admin-users/${admin.id}/edit`}
          className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {admin.name ?? "—"}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="line-clamp-1 text-muted-foreground">{admin.email}</span>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
        <Badge variant={roleVariant} className="text-xs">
          {roleLabel}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={admin.isActive ? "default" : "secondary"}>
          {admin.isActive ? t.common.active : t.common.inactive}
        </Badge>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground lg:table-cell">
        {formatDate(admin.createdAt)}
      </td>
      <td className="px-4 py-3">
        <AdminUserActions admin={admin} t={t} />
      </td>
    </tr>
  );
}

interface AdminUserCardProps {
  admin: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  };
  t: ReturnType<typeof useAdminTranslations>;
}

function AdminUserCard({ admin, t }: AdminUserCardProps) {
  const roleVariant = getRoleBadgeVariant(admin.role);
  const roleLabel = getRoleLabel(admin.role, t);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/admin-users/${admin.id}/edit`}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {admin.name ?? "—"}
          </Link>
          <p className="mt-0.5 max-w-56 truncate text-xs text-muted-foreground">
            {admin.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={admin.isActive ? "default" : "secondary"} className="whitespace-nowrap">
            {admin.isActive ? t.common.active : t.common.inactive}
          </Badge>
          <Badge variant={roleVariant} className="text-xs whitespace-nowrap">
            {roleLabel}
          </Badge>
        </div>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {t.common.adminCreated}: {formatDate(admin.createdAt)}
      </p>

      <div className="flex items-center justify-end">
        <AdminUserActions admin={admin} t={t} />
      </div>
    </div>
  );
}

interface AdminUserActionsProps {
  admin: {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
  };
  t: ReturnType<typeof useAdminTranslations>;
}

function AdminUserActions({ admin, t }: AdminUserActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/admin-users/${admin.id}/edit`}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <Edit className="size-3.5" aria-hidden="true" />
        <span className="sr-only">{t.common.editAdmin} {admin.name ?? admin.email}</span>
      </Link>
      <DeleteAdminDialog
        adminId={admin.id}
        adminName={admin.name ?? admin.email}
      />
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}