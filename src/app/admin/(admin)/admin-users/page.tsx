import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminUsers } from "@/lib/admin/admin-users";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

export const metadata = {
  title: "Admin Users",
};

async function getLanguage(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export default async function AdminUsersPage() {
  const [lang, listResult] = await Promise.all([
    getLanguage(),
    listAdminUsers(),
  ]);
  const t = getServerAdminTranslations(lang);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t.common.adminUsers}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.common.adminUsersDesc}
          </p>
        </div>
        <Button
          size="lg"
          render={
            <Link
              href="/admin/admin-users/new"
              className="inline-flex items-center gap-2"
            >
              <Plus className="size-4" aria-hidden="true" />
              {t.common.addAdmin}
            </Link>
          }
        />
      </div>

      {!listResult.ok ? (
        <SectionError
          title={t.common.couldNotLoadData}
          description={t.common.pleaseTryAgain}
        />
      ) : listResult.data.items.length === 0 ? (
        <div className="rounded-lg border border-border bg-background">
          <EmptyState
            title={t.common.noData}
            description={t.common.adminUsersDesc}
            icon={<UserCog className="size-8 text-muted-foreground" />}
          />
        </div>
      ) : (
        <div>
          <p className="sr-only" role="status">
            {t.common.showing} {listResult.data.total.toLocaleString()} {t.common.adminUsers}
          </p>
          <AdminUsersTable data={listResult.data} />
        </div>
      )}
    </div>
  );
}