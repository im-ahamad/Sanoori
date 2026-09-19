import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminInquiriesNotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="mt-4 font-heading text-lg font-semibold text-foreground">
        Inquiry not found
      </h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        This inquiry does not exist or may have been deleted.
      </p>
      <div className="mt-6">
        <Button render={<Link href="/admin/inquiries" />}>
          Back to inquiries
        </Button>
      </div>
    </div>
  );
}