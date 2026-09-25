"use client";

import { PackageX } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

/**
 * Client error boundary for the catalogue. Keeps the layout intact and offers a
 * reset (retry) plus a safe path back to browsing.
 */
export default function ProductsError({
  error,
  _reset,
}: {
  error: Error & { digest?: string };
  _reset: () => void;
}) {
  return (
    <main className="flex-1">
      <Container>
        <div className="section-spacing flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <PackageX className="size-8 text-muted-foreground" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-foreground">
            The catalogue could not be loaded
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            We hit a problem pulling the latest products. Please try again.
            {error.digest ? (
              <span className="mt-1 block text-xs text-muted-foreground/70">
                Reference: {error.digest}
              </span>
            ) : null}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/products" variant="primary">
              Try again
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Contact us instead
            </ButtonLink>
          </div>
        </div>
      </Container>
    </main>
  );
}