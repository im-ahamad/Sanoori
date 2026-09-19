import Link from "next/link";
import { Search, MousePointerClick, Send, MessageCircle, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";

const steps = [
  {
    title: "Browse",
    description:
      "Explore products and categories in the catalogue, using search and filters to narrow things down.",
    href: "/products",
    cta: "Browse products",
    icon: Search,
  },
  {
    title: "Choose",
    description:
      "Open a product to review its details, specifications, variants, and availability.",
    href: "/products",
    cta: "View product details",
    icon: MousePointerClick,
  },
  {
    title: "Contact",
    description:
      "Use BUY on a product or request a quote with your requirements and quantity.",
    href: "/request-quote",
    cta: "Request a quote",
    icon: Send,
  },
  {
    title: "Discuss",
    description:
      "Continue the conversation on WhatsApp or another contact channel to confirm pricing and availability.",
    href: "/contact",
    cta: "Contact channels",
    icon: MessageCircle,
  },
];

export function HowToBuy() {
  return (
    <section className="section-spacing bg-muted/40">
      <div className="container-sanoori">
        <Reveal>
          <SectionHeader
            align="center"
            title="How to buy"
            description="From browsing the catalogue to discussing your order — no online checkout or payment involved."
          />
        </Reveal>

        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <li className="relative flex h-full flex-col rounded-lg border border-border bg-card p-6">
                <span
                  className="absolute right-6 top-6 font-heading text-sm font-bold text-gold"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex size-12 items-center justify-center rounded-md bg-accent text-primary">
                  <step.icon className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <div className="mt-5 flex flex-1 items-end">
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {step.cta}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}