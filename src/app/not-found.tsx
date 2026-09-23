import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";

export default function NotFound() {
  return (
    <main className="flex-1">
      <div className="section-spacing relative overflow-hidden flex flex-col items-center text-center">
        <VisualBackdrop variant="faint" />
        <Container className="relative">
          <span className="font-heading text-sm font-bold uppercase tracking-widest text-gold">
            404
          </span>
          <h1 className="mt-4 max-w-xl font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The page you are looking for could not be found
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            This page could not be found. It may have moved — head home or
            browse our products instead.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">Back to Home</ButtonLink>
            <ButtonLink href="/products" variant="outline">
              See Products
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </Container>
      </div>
    </main>
  );
}