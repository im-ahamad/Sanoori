import Link from "next/link";
import {
  ArrowRight,
  Eye,
  MessageCircle,
  MessageSquare,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";
import { getConfiguredContactChannels } from "@/lib/contact-channels";
import { getServerTranslations } from "@/lib/i18n/server-translations";

interface JourneyStep {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  cta: string;
}

/**
 * Unified customer journey — replaces the old "Buying from us is simple" and
 * "How to buy" sections with a single guided progression:
 * browse → choose → get a quote → talk with us.
 */
export function CustomerJourney() {
  const talkChannel = getConfiguredContactChannels()[0];
  const t = getServerTranslations("bn");

  const steps = [
    {
      title: t.customerJourney.steps.browse.title,
      description: t.customerJourney.steps.browse.description,
      icon: Search,
      href: "/products",
      cta: t.customerJourney.steps.browse.cta,
    },
    {
      title: t.customerJourney.steps.choose.title,
      description: t.customerJourney.steps.choose.description,
      icon: Eye,
      href: "/products",
      cta: t.customerJourney.steps.choose.cta,
    },
    {
      title: t.customerJourney.steps.askPrice.title,
      description: t.customerJourney.steps.askPrice.description,
      icon: MessageSquare,
      href: "/products",
      cta: t.customerJourney.steps.askPrice.cta,
    },
    {
      title: t.customerJourney.steps.talk.title,
      description: talkChannel
        ? t.customerJourney.steps.talk.description.replace("{channel}", talkChannel.label)
        : t.customerJourney.steps.talk.description.replace("{channel}", t.common.contactUs),
      icon: MessageCircle,
      href: talkChannel?.href ?? "/contact",
      cta: talkChannel?.label ?? t.customerJourney.steps.talk.cta,
    },
  ];

  return (
    <section className="section-spacing bg-background">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow={t.customerJourney.eyebrow}
            title={t.customerJourney.title}
            description={t.customerJourney.description}
          />
        </Reveal>

        {/* Connectors must live outside the <ol> to keep the list semantic */}
        <div className="relative mx-auto mt-14 w-full max-w-xl lg:max-w-none">
          {/* Mobile / tablet vertical connector */}
          <span
            className="absolute bottom-6 left-6 top-6 w-px bg-gold/25 lg:hidden"
            aria-hidden="true"
          />
          {/* Desktop horizontal progress line */}
          <span
            className="absolute left-0 right-0 top-6 hidden h-px bg-gold/25 lg:block"
            aria-hidden="true"
          />

          <ol className="grid gap-10 sm:gap-12 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative flex gap-5 sm:gap-6 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
                >
                  {/* Numbered node */}
                  <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-background font-heading text-base font-bold text-gold shadow-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="lg:mt-6">
                    <h3 className="flex items-center gap-2.5 font-heading text-lg font-semibold text-foreground lg:justify-center">
                      <Icon className="size-5 shrink-0 text-gold-dark" aria-hidden="true" />
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <Link
                      href={step.href}
                      className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-sm px-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-0 lg:px-0"
                    >
                      {step.cta}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}