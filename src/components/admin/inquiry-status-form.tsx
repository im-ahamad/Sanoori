"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  inquiryStatusDescriptions,
  inquiryStatusLabel,
  inquiryStatusValues,
} from "@/lib/inquiries";
import {
  updateInquiryStatusAction,
  type UpdateInquiryStatusActionResult,
} from "@/lib/actions/admin-inquiries";

interface InquiryStatusFormProps {
  inquiryId: string;
  currentStatus: string;
}

export function InquiryStatusForm({
  inquiryId,
  currentStatus,
}: InquiryStatusFormProps) {
  const [state, formAction, pending] = useActionState<
    UpdateInquiryStatusActionResult | undefined,
    FormData
  >(updateInquiryStatusAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="inquiryId" value={inquiryId} />

      <div className="space-y-1.5">
        <label
          htmlFor="inquiry-status"
          className="text-sm font-medium text-muted-foreground"
        >
          Status
        </label>
        <select
          id="inquiry-status"
          name="status"
          defaultValue={currentStatus}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {inquiryStatusValues.map((value) => (
            <option key={value} value={value}>
              {inquiryStatusLabel(value)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {inquiryStatusDescriptions[currentStatus]}
        </p>
      </div>

      <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Recommended flow: New → Contacted → Processing → Completed. You can also
        mark an inquiry as Cancelled when it is no longer needed.
      </p>

      {state && !state.ok && !pending ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Update status"}
      </Button>
    </form>
  );
}