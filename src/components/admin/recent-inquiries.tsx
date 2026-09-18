import { Inbox } from "lucide-react";
import type { RecentInquiry } from "@/lib/admin/dashboard";
import { EmptyState } from "@/components/shared/empty-state";

const statusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<string, { dot: string; badge: string }> = {
  NEW: {
    dot: "bg-gold",
    badge: "bg-accent text-gold-dark",
  },
  CONTACTED: {
    dot: "bg-navy-light",
    badge: "bg-muted text-foreground",
  },
  PROCESSING: {
    dot: "bg-navy",
    badge: "bg-muted text-foreground",
  },
  COMPLETED: {
    dot: "bg-gold-dark",
    badge: "bg-accent text-gold-dark",
  },
  CANCELLED: {
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatSource(source: string): string {
  return source
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function RecentInquiries({ inquiries }: { inquiries: RecentInquiry[] }) {
  if (inquiries.length === 0) {
    return (
      <section aria-labelledby="recent-inquiries-heading">
        <h2
          id="recent-inquiries-heading"
          className="font-heading text-base font-bold tracking-tight text-foreground"
        >
          Recent inquiries
        </h2>
        <div className="mt-4 rounded-lg border border-border bg-background">
          <EmptyState
            title="No inquiries yet"
            description="When customers submit a quote request, it will show up here."
            icon={<Inbox className="size-8 text-muted-foreground" />}
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="recent-inquiries-heading">
      <div className="flex items-center justify-between">
        <h2
          id="recent-inquiries-heading"
          className="font-heading text-base font-bold tracking-tight text-foreground"
        >
          Recent inquiries
        </h2>
      </div>

      {/* Desktop table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Customer
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                Product
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">
                Source
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map((inquiry) => {
              const status = statusStyles[inquiry.status];
              return (
                <tr
                  key={inquiry.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {inquiry.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground lg:hidden">
                      {formatDate(inquiry.createdAt)}
                    </p>
                  </td>
                  <td className="hidden max-w-56 px-4 py-3 text-muted-foreground md:table-cell">
                    <span className="line-clamp-1">
                      {inquiry.productName ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatSource(inquiry.source)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${status.dot}`}
                        aria-hidden="true"
                      />
                      {statusLabels[inquiry.status] ?? inquiry.status}
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatDate(inquiry.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}