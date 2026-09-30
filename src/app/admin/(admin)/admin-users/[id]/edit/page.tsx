import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAdminUserDetail } from "@/lib/admin/admin-users";
import { updateAdminAction } from "@/lib/actions/admin-users";
import { AdminUserForm } from "@/components/admin/admin-user-form";
import { SectionError } from "@/components/admin/section-error";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Edit Admin",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditAdminPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getAdminUserDetail(id);

  if (!result.ok) {
    if (result.error === "not-found") notFound();
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
        <SectionError
          title="Could not load admin"
          description="We could not load this admin. Please try again in a moment."
        />
      </div>
    );
  }

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
          Edit admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the administrator account details. Password cannot be changed from here.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background p-4 sm:p-6">
        <AdminUserForm
          mode="edit"
          action={updateAdminAction}
          initial={{
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            isActive: result.data.isActive,
          }}
        />
      </div>
    </div>
  );
}