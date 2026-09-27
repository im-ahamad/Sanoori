import { Package, Tags, Users, FileText, Inbox, MessageSquare, CheckCircle } from "lucide-react";
import {
  getAdminDashboardStats,
  getRecentOrders,
} from "@/lib/admin/dashboard";
import { StatCard } from "@/components/admin/stat-card";
import { QuickActions } from "@/components/admin/quick-actions";
import { RecentOrders } from "@/components/admin/recent-orders";
import { SectionError } from "@/components/admin/section-error";
import { cookies } from "next/headers";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";

export const metadata = {
  title: "Dashboard",
};

async function getLanguage(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export default async function AdminDashboardPage() {
  const [lang, statsResult, ordersResult] = await Promise.all([
    getLanguage(),
    getAdminDashboardStats(),
    getRecentOrders(),
  ]);
  const t = getServerAdminTranslations(lang);

  return (
    <div className="space-y-10 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.common.dashboard}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.common.overviewCatalogueOrders}
        </p>
      </div>

      {statsResult.ok ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <StatCard
            label={t.common.products}
            value={statsResult.data.products}
            icon={Package}
            hint={t.common.activeProducts}
          />
          <StatCard
            label={t.common.categories}
            value={statsResult.data.categories}
            icon={Tags}
            hint={t.common.activeCategories}
          />
          <StatCard
            label={t.common.customers}
            value={statsResult.data.customers}
            icon={Users}
            hint={t.common.uniqueCustomers}
          />
          <StatCard
            label={t.common.totalOrders}
            value={statsResult.data.totalOrders}
            icon={FileText}
            hint={t.common.allOrdersReceived}
          />
          <StatCard
            label={t.common.newOrders}
            value={statsResult.data.newOrders}
            icon={Inbox}
            hint={t.common.waitingForReply}
            href="/admin/orders?status=NEW"
          />
          <StatCard
            label={t.common.contactedOrders}
            value={statsResult.data.contactedOrders}
            icon={MessageSquare}
            hint={t.common.inProgress}
            href="/admin/orders?status=CONTACTED"
          />
          <StatCard
            label={t.common.completedOrders}
            value={statsResult.data.completedOrders}
            icon={CheckCircle}
            hint={t.common.handledAndClosed}
            href="/admin/orders?status=COMPLETED"
          />
        </div>
      ) : (
        <SectionError
          title={t.common.couldNotLoadStatistics}
          description={t.common.pleaseTryAgain}
        />
      )}

      <QuickActions />

      {ordersResult.ok ? (
        <RecentOrders orders={ordersResult.data} />
      ) : (
        <section aria-labelledby="recent-orders-heading">
          <h2
            id="recent-orders-heading"
            className="font-heading text-base font-bold tracking-tight text-foreground"
          >
            {t.common.recentOrders}
          </h2>
          <div className="mt-4">
            <SectionError
              title={t.common.couldNotLoadOrders}
              description={t.common.pleaseTryAgain}
            />
          </div>
        </section>
      )}
    </div>
  );
}