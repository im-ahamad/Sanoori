import { cn } from "@/lib/utils";
import {
  inquiryStatusLabel,
  inquiryStatusToneFor,
} from "@/lib/inquiries";

interface InquiryStatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Status pill shared across the admin dashboard, inquiry list and inquiry
 * detail. The textual label is always present so meaning is never conveyed
 * through colour alone.
 */
export function InquiryStatusBadge({ status, className }: InquiryStatusBadgeProps) {
  const tone = inquiryStatusToneFor(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone.badge,
        className
      )}
      title={`Status: ${inquiryStatusLabel(status)}`}
    >
      <span className={cn("size-1.5 rounded-full", tone.dot)} aria-hidden="true" />
      {inquiryStatusLabel(status)}
    </span>
  );
}