"use client";

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";
import { useTranslations } from "@/lib/i18n";

export function Hero() {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden bg-navy-dark text-white">
      {/* Full-bleed hero image — object-cover so it fills edge-to-edge with no letterbox gaps */}
      <VisualBackdrop
        variant="hero"
        priority
        src="/images/hero.jpg"
        objectFit="object-cover"
        objectPosition="object-center sm:object-[60%_center] md:object-[55%_center] lg:object-[60%_center] xl:object-[64%_center]"
        noZoom
        overlayClassName="bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_48%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_28%,transparent)_30%,color-mix(in_oklab,var(--navy-dark)_12%,transparent)_58%,transparent_80%)]"
      />

      <div className="relative h-full w-full px-4 sm:px-6 lg:px-8">
        <div
          className="flex h-full items-start pt-10 sm:pt-12 lg:pt-16 lg:min-h-[calc(100dvh-5rem)]"
        >
          <div className="w-full max-w-7xl mx-auto lg:ml-24">
            <div className="max-w-[48rem]">
              {/* Gold eyebrow */}
              <p className="hero-intro flex items-center gap-3 text-[0.7rem] sm:text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold">
                <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
                {t.hero.eyebrow}
              </p>

              {/* Main heading - large editorial, fluid clamp */}
              <h1 className="hero-intro hero-intro-d1 mt-4 font-heading font-semibold leading-[0.98] tracking-tight text-white clamp-text-4xl-6xl">
                {t.hero.title}
              </h1>

              {/* Supporting tagline */}
              <p className="hero-intro hero-intro-d2 mt-5 max-w-[32rem] text-sm leading-[1.7] text-white/85 sm:text-base sm:leading-[1.8] lg:text-lg lg:leading-[2rem]">
                {t.hero.description}
              </p>

              {/* CTA buttons — side-by-side on mobile, stacked only when absolutely necessary */}
              <div className="hero-intro hero-intro-d3 mt-8 flex flex-wrap gap-2 sm:items-center">
                <ButtonLink
                  href="/products"
                  variant="inverse"
                  size="lg"
                  className="w-full sm:w-auto min-w-0 flex-1"
                >
                  {t.hero.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              </div>

              {/* Bottom-left corner caption (desktop only) */}
              <div className="hidden md:block absolute bottom-0 left-0 border-t border-r border-white/10 bg-navy-dark/50 px-5 py-4 text-xs text-white/60">
                {t.hero.footer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}