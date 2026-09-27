import { InquirySource, InquiryStatus } from "@/generated/prisma";

export const inquiryStatusValues: ReadonlyArray<InquiryStatus> =
  Object.values(InquiryStatus);

export const inquirySourceValues: ReadonlyArray<InquirySource> =
  Object.values(InquirySource);

export function isInquiryStatus(value: unknown): value is InquiryStatus {
  return (
    typeof value === "string" &&
    (inquiryStatusValues as ReadonlyArray<string>).includes(value)
  );
}

export function isInquirySource(value: unknown): value is InquirySource {
  return (
    typeof value === "string" &&
    (inquirySourceValues as ReadonlyArray<string>).includes(value)
  );
}

export const inquiryStatusLabels: Record<string, string> = {
  [InquiryStatus.NEW]: "New",
  [InquiryStatus.CONTACTED]: "Contacted",
  [InquiryStatus.PROCESSING]: "Processing",
  [InquiryStatus.COMPLETED]: "Completed",
  [InquiryStatus.CANCELLED]: "Cancelled",
};

export const inquiryStatusDescriptions: Record<string, string> = {
  [InquiryStatus.NEW]: "Received and awaiting a first response.",
  [InquiryStatus.CONTACTED]: "You have reached out to the customer.",
  [InquiryStatus.PROCESSING]: "Requirements are being worked on.",
  [InquiryStatus.COMPLETED]: "Request handled and closed.",
  [InquiryStatus.CANCELLED]: "No longer needed by the customer.",
};

export function inquiryStatusLabel(status: string): string {
  return inquiryStatusLabels[status] ?? status;
}

export const inquiryStatusTone: Record<string, { dot: string; badge: string }> = {
  [InquiryStatus.NEW]: {
    dot: "bg-gold",
    badge: "bg-accent text-gold-dark",
  },
  [InquiryStatus.CONTACTED]: {
    dot: "bg-navy-light",
    badge: "bg-muted text-foreground",
  },
  [InquiryStatus.PROCESSING]: {
    dot: "bg-navy",
    badge: "bg-muted text-foreground",
  },
  [InquiryStatus.COMPLETED]: {
    dot: "bg-gold-dark",
    badge: "bg-accent text-gold-dark",
  },
  [InquiryStatus.CANCELLED]: {
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

export function inquiryStatusToneFor(status: string): {
  dot: string;
  badge: string;
} {
  return (
    inquiryStatusTone[status] ?? {
      dot: "bg-muted-foreground",
      badge: "bg-muted text-muted-foreground",
    }
  );
}

export const inquirySourceLabels: Record<string, string> = {
  [InquirySource.WEBSITE]: "Website",
  [InquirySource.WHATSAPP]: "WhatsApp",
  [InquirySource.FACEBOOK]: "Facebook",
  [InquirySource.INSTAGRAM]: "Instagram",
  [InquirySource.TELEGRAM]: "Telegram",
  [InquirySource.PHONE]: "Phone",
};

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function inquirySourceLabel(source: string): string {
  return inquirySourceLabels[source] ?? titleCase(source);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatInquiryDate(value: Date): string {
  return DATE_FORMATTER.format(value);
}