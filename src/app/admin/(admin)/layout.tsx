import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, type UserRole } from "@/lib/auth/permissions";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: {
    default: "Admin",
    template: "%s | Sanoori Trading Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

/**
 * Authoritative server-side gate for the whole /admin area.
 *
 * Session is validated on the Node.js runtime on every request — this is the
 * real security boundary (the edge proxy is only an optimistic UX gate).
 */
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await auth();

  if (!session?.user) {
    redirect("/secure-admin");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, permissions: true, isActive: true },
  });

  if (!user || !user.isActive) {
    redirect("/secure-admin");
  }

  if (!hasPermission(user.role as UserRole, user.permissions, "dashboard:read")) {
    redirect("/secure-admin");
  }

  return (
    <AdminShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }}
      role={user.role as UserRole}
      permissions={user.permissions as string[]}
    >
      {children}
    </AdminShell>
  );
}