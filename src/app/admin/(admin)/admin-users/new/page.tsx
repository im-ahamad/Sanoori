import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createAdminAction } from "@/lib/actions/admin-users";
import { AdminUserForm } from "@/components/admin/admin-user-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "New Admin",
};

export default function AdminNewAdminPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          href="/admin/admin-users"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to admin users
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          New admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new administrator to the admin panel. They will receive the ADMIN role automatically.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background p-4 sm:p-6">
        <AdminUserForm
          mode="create"
          action={createAdminAction}
        />
      </div>
    </div>
  );
}