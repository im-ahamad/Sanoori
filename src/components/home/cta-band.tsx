import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-navy-dark text-white">
      <VisualBackdrop variant="hero" objectPosition="object-center" />
      {/* Editorial washes — keep image subtle while ensuring strong text contrast */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-dark/[0.93] via-navy-dark/85 to-navy-dark/55"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark/35 via-transparent to-transparent"
      />
      {/* Restrained top hairline separates from DiscoveryCta (navy → navy-dark) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"
      />

      <Container>
        <div className="relative py-16 sm:py-20 lg:py-28">
          <Reveal>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <div className="max-w-2xl">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold-light">
                  <span className="h-px w-8 bg-gold" aria-hidden="true" />
                  Ready to get started?
                </p>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
                  Let&rsquo;s Find the Right Products for Your Project
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                  Tell us what you need and we&rsquo;ll help you explore the
                  right products for your project.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <ButtonLink
                  href="/request-quote"
                  variant="inverse"
                  size="lg"
                  className="w-full sm:w-auto lg:w-full xl:w-auto min-w-[184px]"
                >
                  Get a Quote
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink
                  href="/products"
                  variant="outline-inverse"
                  size="lg"
                  className="w-full sm:w-auto lg:w-full xl:w-auto min-w-[184px]"
                >
                  Browse Products
                </ButtonLink>
              </div>
            </div>
          </Reveal>

          {/* Subtle editorial rule — premium closing detail, desktop only */}
          <div
            aria-hidden="true"
            className="mt-14 hidden h-px bg-gradient-to-r from-gold/35 via-white/10 to-transparent lg:block"
          />
        </div>
      </Container>
    </section>
  );
}
