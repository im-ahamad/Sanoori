"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig, navigationConfig } from "@/config/site";
import { getActiveCategories } from "@/data/categories";

const gridOverlayStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

export function Hero() {
  const categories = getActiveCategories();

  return (
    <section className="relative overflow-hidden bg-navy-dark text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={gridOverlayStyle}
      />
      <Container>
        <div className="relative py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80">
              {siteConfig.tagline}
            </span>
            <h1 className="mt-6 max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Reliable supply of sanitary ware, tiles &amp; building materials
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {siteConfig.description} We source quality products for
              residential and commercial projects across Bangladesh.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" variant="inverse" size="lg">
                Explore Products
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href={navigationConfig.cta.href}
                variant="outline-inverse"
                size="lg"
              >
                Request a Quote
              </ButtonLink>
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/80 transition-colors hover:border-gold/60 hover:text-gold"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}