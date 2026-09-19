"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="size-7 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="mt-4 font-heading text-lg font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        This product section hit an unexpected problem. Your data is safe —
        please try again.
      </p>
      <p className="sr-only">Error reference: {error.digest}</p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}