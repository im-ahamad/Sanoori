"use client";

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig, navigationConfig } from "@/config/site";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-dark text-white">
      {/* Full-bleed hero image with right-biased focal point (64% center) */}
      <VisualBackdrop
        variant="hero"
        priority
        src="/images/hero.jpg"
        objectPosition="object-[64%_center]"
        className="[&>div]:opacity-100"
      />

      {/* Custom left-to-right navy gradient overlay - stronger than VisualBackdrop default */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--navy-dark)_0%,color-mix(in_oklab,var(--navy-dark)_92%,transparent)_35%,color-mix(in_oklab,var(--navy-dark)_20%,transparent)_72%,transparent)]"
      />

      <div className="relative h-full w-full px-4 sm:px-6 lg:px-8">
        <div
          className="flex h-full items-center"
          style={{ minHeight: "calc(100dvh - 4rem)" }}
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="max-w-[48rem]">
              {/* Gold eyebrow */}
              <p className="hero-intro flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold">
                <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
                {siteConfig.name}
              </p>

              {/* Main heading - large editorial */}
              <h1 className="hero-intro hero-intro-d1 mt-4 font-heading font-semibold leading-[0.98] tracking-tight text-white clamp-text-4xl-6xl">
                Sanitary Ware, Tiles & Building Materials
              </h1>

              {/* Supporting tagline */}
              <p className="hero-intro hero-intro-d2 mt-6 max-w-[32rem] text-base leading-[2rem] text-white/85 sm:text-lg">
                Sanoori Trading supplies premium sanitary ware, tiles, and building
                materials for homes and commercial projects across Bangladesh.
              </p>

              {/* CTA buttons */}
              <div className="hero-intro hero-intro-d3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink
                  href={navigationConfig.cta.href}
                  variant="inverse"
                  size="lg"
                >
                  {navigationConfig.cta.label}
                </ButtonLink>
                <ButtonLink
                  href="/products"
                  variant="outline-inverse"
                  size="lg"
                >
                  Browse Products
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              </div>

              {/* Bottom-left corner caption (desktop only) */}
              <div className="hidden md:block absolute bottom-0 left-0 border-t border-r border-white/10 bg-navy-dark/50 px-5 py-4 text-xs text-white/60">
                Sanoori Trading &mdash; Since 2018
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}