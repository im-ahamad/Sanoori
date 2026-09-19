import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import type { RecentInquiry } from "@/lib/admin/dashboard";
import { EmptyState } from "@/components/shared/empty-state";
import { InquiryStatusBadge } from "@/components/admin/inquiry-status-badge";
import { formatInquiryDate, inquirySourceLabel } from "@/lib/inquiries";

function formatDate(date: Date): string {
  return formatInquiryDate(date);
}

function formatSource(source: string): string {
  return inquirySourceLabel(source);
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
      <div className="flex items-center justify-between gap-3">
        <h2
          id="recent-inquiries-heading"
          className="font-heading text-base font-bold tracking-tight text-foreground"
        >
          Recent inquiries
        </h2>
        <Link
          href="/admin/inquiries"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
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
            {inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/inquiries/${inquiry.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {inquiry.customerName}
                  </Link>
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
                  <InquiryStatusBadge status={inquiry.status} />
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">
                  {formatDate(inquiry.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}