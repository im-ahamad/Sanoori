import { ArrowRight } from "lucide-react";
import {
  MessageCircle,
  MessagesSquare,
  Camera,
  Send,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { navigationConfig } from "@/config/site";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { getConfiguredContactChannels } from "@/lib/contact-channels";
import type { ContactChannelId } from "@/lib/contact-channels";
import { Reveal } from "@/components/shared/reveal";

const gridOverlayStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

const CHANNEL_ICONS: Record<ContactChannelId, LucideIcon> = {
  whatsapp: MessageCircle,
  facebook: MessagesSquare,
  instagram: Camera,
  telegram: Send,
  phone: Phone,
};

export function CtaBand() {
  const whatsappHref = buildWhatsAppLink(GENERAL_ENQUIRY_MESSAGE);
  const channels = getConfiguredContactChannels();

  return (
    <section className="relative overflow-hidden bg-navy-dark text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={gridOverlayStyle}
      />
      <Container>
        <div className="relative section-spacing flex flex-col items-center text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Need help choosing the right products?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Tell us your requirements and we will respond with pricing and
              current availability for the items you need.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <ButtonLink
                href={navigationConfig.cta.href}
                variant="inverse"
                size="lg"
              >
                Request a Quote
                <ArrowRight className="size-4" />
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
              <ButtonLink href="/contact" variant="outline-inverse" size="lg">
                Contact Us
              </ButtonLink>
            </div>

            {channels.length > 0 && (
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Prefer another channel?
                </p>
                <ul className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {channels.map((channel) => {
                    const Icon = CHANNEL_ICONS[channel.id];
                    return (
                      <li key={channel.id}>
                        <a
                          href={channel.href}
                          target={channel.id === "phone" ? undefined : "_blank"}
                          rel={
                            channel.id === "phone"
                              ? undefined
                              : "noopener noreferrer"
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          {channel.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}