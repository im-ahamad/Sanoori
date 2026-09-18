import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }}
    >
      {children}
    </AdminShell>
  );
}