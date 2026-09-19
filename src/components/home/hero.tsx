"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig, navigationConfig } from "@/config/site";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { getCategoryIconElement } from "@/lib/category-icons";
import type { PublicCategory } from "@/lib/public/catalogue";

const gridOverlayStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

export function Hero({ categories }: { categories: PublicCategory[] }) {
  const reduceMotion = useReducedMotion();
  const whatsappHref = buildWhatsAppLink(GENERAL_ENQUIRY_MESSAGE);
  const browseCategories = categories.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-navy-dark text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={gridOverlayStyle}
      />
      <Container>
        <div className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:items-center">
            {/* Copy + primary actions */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
                {siteConfig.tagline}
              </span>
              <h1 className="mt-6 max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Sanoori Trading
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                {siteConfig.description} Browse the catalogue, review product
                details, and request a quote — we respond directly through
                WhatsApp and other contact channels.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
                {whatsappHref && (
                  <ButtonLink
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline-inverse"
                    size="lg"
                  >
                    WhatsApp
                  </ButtonLink>
                )}
              </div>
            </motion.div>

            {/* Business-areas browse panel (real DB categories) */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Browse by category
                </p>
                <ul className="mt-4 space-y-3">
                  {browseCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-gold/50 hover:bg-white/10"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold">
                          {getCategoryIconElement(category.slug, {
                            className: "size-5",
                            strokeWidth: 1.75,
                          })}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-white">
                            {category.name}
                          </span>
                          {category.description && (
                            <span className="mt-0.5 block truncate text-xs text-white/60">
                              {category.description}
                            </span>
                          )}
                        </span>
                        <ArrowRight
                          className="size-4 shrink-0 text-white/40 transition-colors group-hover:text-gold"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-white/50">
                  Every category links to the live product catalogue.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}