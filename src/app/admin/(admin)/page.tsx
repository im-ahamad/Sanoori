import { Package, Tags, Users, FileText, Inbox, MessageSquare, CheckCircle } from "lucide-react";
import {
  getAdminDashboardStats,
  getRecentOrders,
} from "@/lib/admin/dashboard";
import { StatCard } from "@/components/admin/stat-card";
import { QuickActions } from "@/components/admin/quick-actions";
import { RecentOrders } from "@/components/admin/recent-orders";
import { SectionError } from "@/components/admin/section-error";

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [statsResult, ordersResult] = await Promise.all([
    getAdminDashboardStats(),
    getRecentOrders(),
  ]);

  return (
    <div className="space-y-10 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of your catalogue and customer orders.
        </p>
      </div>

      {statsResult.ok ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <StatCard
            label="Products"
            value={statsResult.data.products}
            icon={Package}
            hint="Active products"
          />
          <StatCard
            label="Categories"
            value={statsResult.data.categories}
            icon={Tags}
            hint="Active categories"
          />
          <StatCard
            label="Customers"
            value={statsResult.data.customers}
            icon={Users}
            hint="Unique customers"
          />
          <StatCard
            label="Total Orders"
            value={statsResult.data.totalOrders}
            icon={FileText}
            hint="All orders received"
          />
          <StatCard
            label="New Orders"
            value={statsResult.data.newOrders}
            icon={Inbox}
            hint="Waiting for your reply"
            href="/admin/orders?status=NEW"
          />
          <StatCard
            label="Contacted"
            value={statsResult.data.contactedOrders}
            icon={MessageSquare}
            hint="In progress"
            href="/admin/orders?status=CONTACTED"
          />
          <StatCard
            label="Completed"
            value={statsResult.data.completedOrders}
            icon={CheckCircle}
            hint="Handled and closed"
            href="/admin/orders?status=COMPLETED"
          />
        </div>
      ) : (
        <SectionError
          title="Could not load statistics"
          description="We could not load the dashboard statistics. Please try again in a moment."
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
            Recent orders
          </h2>
          <div className="mt-4">
            <SectionError
              title="Could not load orders"
              description="We could not load the recent orders. Please try again in a moment."
            />
          </div>
        </section>
      )}
    </div>
  );
}