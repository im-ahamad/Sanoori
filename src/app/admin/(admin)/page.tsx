import { Package, Tags, MessagesSquare, Inbox } from "lucide-react";
import {
  getAdminDashboardStats,
  getRecentInquiries,
} from "@/lib/admin/dashboard";
import { StatCard } from "@/components/admin/stat-card";
import { QuickActions } from "@/components/admin/quick-actions";
import { RecentInquiries } from "@/components/admin/recent-inquiries";
import { SectionError } from "@/components/admin/section-error";

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [statsResult, inquiriesResult] = await Promise.all([
    getAdminDashboardStats(),
    getRecentInquiries(),
  ]);

  return (
    <div className="space-y-10 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of your catalogue and customer inquiries.
        </p>
      </div>

      {statsResult.ok ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            label="New Inquiries"
            value={statsResult.data.newInquiries}
            icon={Inbox}
            hint="Waiting for your reply"
            href="/admin/inquiries?status=NEW"
          />
          <StatCard
            label="Total Inquiries"
            value={statsResult.data.inquiries}
            icon={MessagesSquare}
            hint="Received so far"
            href="/admin/inquiries"
          />
        </div>
      ) : (
        <SectionError
          title="Could not load statistics"
          description="We could not load the dashboard statistics. Please try again in a moment."
        />
      )}

      <QuickActions />

      {inquiriesResult.ok ? (
        <RecentInquiries inquiries={inquiriesResult.data} />
      ) : (
        <section aria-labelledby="recent-inquiries-heading">
          <h2
            id="recent-inquiries-heading"
            className="font-heading text-base font-bold tracking-tight text-foreground"
          >
            Recent inquiries
          </h2>
          <div className="mt-4">
            <SectionError
              title="Could not load inquiries"
              description="We could not load the recent inquiries. Please try again in a moment."
            />
          </div>
        </section>
      )}
    </div>
  );
}