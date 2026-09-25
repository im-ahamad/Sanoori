import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";
import { getServerTranslations } from "@/lib/i18n/server-translations";

export function DiscoveryCta() {
  const t = getServerTranslations("bn");

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <VisualBackdrop variant="band" />
      <Container>
        <div className="section-spacing relative">
          <Reveal>
            <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="max-w-2xl lg:col-span-7">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold-light">
                  <span className="h-px w-8 bg-gold" aria-hidden="true" />
                  {t.discoveryCta.eyebrow}
                </p>
                <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {t.discoveryCta.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                  {t.discoveryCta.description}
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="relative border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                  <span
                    className="absolute inset-x-6 top-0 h-px bg-gold/70"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-3">
                    <ButtonLink href="/products" variant="inverse" size="lg">
                      {t.discoveryCta.ctaPrimary}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </ButtonLink>
                    <ButtonLink href="/products" variant="outline-inverse" size="lg">
                      {t.discoveryCta.ctaSecondary}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}