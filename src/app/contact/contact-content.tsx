"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { getCategoryIconElement } from "@/lib/category-icons";
import { isConfigPlaceholder } from "@/lib/config";
import {
  buildWhatsAppChatLink,
  GENERAL_ENQUIRY_MESSAGE,
} from "@/lib/contact/whatsapp";
import { useTranslations } from "@/lib/i18n";
import { businessConfig } from "@/config/site";
import type { PublicBusinessSettings } from "@/lib/public/settings";
import { cn } from "@/lib/utils";

const FEATURED_CATEGORY_SLUGS = [
  "sanitary-ware",
  "tiles",
  "building-materials",
] as const;

function resolveSetting(stored: string | null, configured: string): string {
  if (stored === null || isConfigPlaceholder(stored)) {
    return configured;
  }
  return stored;
}

const isSet = (value: string): boolean => !isConfigPlaceholder(value);

interface ContactCategory {
  slug: string;
  name: string;
}

interface ContactPageContentProps {
  businessSettings: PublicBusinessSettings;
  categories: ContactCategory[];
}

interface ContactDetail {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  isExternal?: boolean;
}

/* ------------------------------------------------------------------ *
 * Decorative layers — architectural blueprint motifs
 * ------------------------------------------------------------------ */

const CORNER_GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(148,163,184,0.20) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.20) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  maskImage: "radial-gradient(65% 65% at 100% 0%, black, transparent)",
  WebkitMaskImage: "radial-gradient(65% 65% at 100% 0%, black, transparent)",
};

const DARK_GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(90% 90% at 0% 0%, black 25%, transparent 85%)",
  WebkitMaskImage:
    "radial-gradient(90% 90% at 0% 0%, black 25%, transparent 85%)",
};

const MAP_BLUEPRINT: CSSProperties = {
  backgroundColor: "var(--muted)",
  backgroundImage:
    /* fine grid */
    "linear-gradient(to right, rgba(120,134,158,0.14) 1px, transparent 1px), " +
    "linear-gradient(to bottom, rgba(120,134,158,0.14) 1px, transparent 1px), " +
    /* city blocks */
    "linear-gradient(to right, rgba(120,134,158,0.26) 1px, transparent 1px), " +
    "linear-gradient(to bottom, rgba(120,134,158,0.26) 1px, transparent 1px), " +
    /* arterial roads */
    "linear-gradient(to bottom, transparent calc(38% - 7px), rgba(120,134,158,0.30) calc(38% - 7px), rgba(120,134,158,0.30) calc(38% + 7px), transparent calc(38% + 7px)), " +
    "linear-gradient(to right, transparent calc(61% - 6px), rgba(120,134,158,0.30) calc(61% - 6px), rgba(120,134,158,0.30) calc(61% + 6px), transparent calc(61% + 6px)), " +
    "linear-gradient(118deg, transparent calc(52% - 4px), rgba(120,134,158,0.24) calc(52% - 4px), rgba(120,134,158,0.24) calc(52% + 4px), transparent calc(52% + 4px))",
  backgroundSize:
    "28px 28px, 28px 28px, 140px 140px, 140px 140px, 100% 100%, 100% 100%, 100% 100%",
};

/* ------------------------------------------------------------------ *
 * Button system — one shape, restrained states
 * ------------------------------------------------------------------ */

const BTN =
  "group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-[0.01em] transition-all duration-300 ease-out active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto";

const BTN_CALL =
  "bg-gold text-navy-dark shadow-[0_14px_28px_-18px_rgba(198,158,74,0.95)] hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_18px_32px_-18px_rgba(198,158,74,0.9)] focus-visible:ring-gold/70 focus-visible:ring-offset-navy-dark";

const BTN_WHATSAPP =
  "bg-[#25D366] text-white shadow-[0_14px_28px_-18px_rgba(37,211,102,0.95)] hover:-translate-y-0.5 hover:bg-[#1EBE5B] hover:shadow-[0_18px_32px_-18px_rgba(37,211,102,0.9)] focus-visible:ring-[#25D366] focus-visible:ring-offset-navy-dark";

const BTN_MAP =
  "border border-gold/45 bg-gold/10 text-gold-text hover:-translate-y-0.5 hover:border-gold/75 hover:bg-gold/20 focus-visible:ring-gold/50 focus-visible:ring-offset-card";

const BTN_CATALOGUE =
  "border border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-gold/50 hover:text-gold-text focus-visible:ring-gold/40 focus-visible:ring-offset-card";

const CARD_SHELL =
  "rounded-2xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_40px_-30px_rgba(16,24,40,0.30)] transition-all duration-300 ease-out";

const ICON_SHELL =
  "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ease-out";

const ICON_GOLD = "border-gold/25 bg-gold/10 text-gold-text";
const ICON_GREEN =
  "border-[#25D366]/30 bg-[#25D366]/10 text-[#0F7B4F] dark:text-[#25D366]";
const ICON_ON_DARK = "border-white/15 bg-white/10 text-gold-light";
const ICON_ON_DARK_GREEN =
  "border-[#25D366]/35 bg-[#25D366]/12 text-[#25D366]";

const LABEL_MICRO =
  "text-[0.66rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-300";

function indexLabel(index: number): string {
  return index < 10 ? `0${index}` : String(index);
}

export function ContactPageContent({
  businessSettings,
  categories,
}: ContactPageContentProps) {
  const t = useTranslations();
  const cp = t.contactPage;
  const contact = t.contact;

  const whatsappHref = buildWhatsAppChatLink(
    resolveSetting(businessSettings.whatsapp, businessConfig.whatsapp),
    GENERAL_ENQUIRY_MESSAGE
  );
  const mapsHref = businessSettings.maps.googleMapsLink;
  const mapsEmbed = businessSettings.maps.googleMapsEmbed;

  const phone = resolveSetting(businessSettings.phone, businessConfig.phone);
  const whatsapp = resolveSetting(businessSettings.whatsapp, businessConfig.whatsapp);
  const email = resolveSetting(businessSettings.email, businessConfig.email);
  const street = resolveSetting(businessSettings.address, businessConfig.address);
  const city = resolveSetting(businessSettings.city, businessConfig.city);
  const country = resolveSetting(businessSettings.country, businessConfig.country);

  const address = [street, city, country].filter(isSet).join(", ");

  const contactDetails: ContactDetail[] = [];

  if (isSet(phone)) {
    contactDetails.push({
      key: "phone",
      icon: Phone,
      label: cp.contactInfo.phone,
      value: phone,
      href: `tel:${phone}`,
    });
  }

  if (isSet(whatsapp)) {
    contactDetails.push({
      key: "whatsapp",
      icon: MessageCircle,
      label: cp.contactInfo.whatsapp,
      value: whatsapp,
      href: whatsappHref ?? undefined,
      isExternal: true,
    });
  }

  if (isSet(email)) {
    contactDetails.push({
      key: "email",
      icon: Mail,
      label: cp.contactInfo.email,
      value: email,
      href: `mailto:${email}`,
    });
  }

  if (address) {
    contactDetails.push({
      key: "address",
      icon: MapPin,
      label: cp.contactInfo.address,
      value: address,
      href: mapsHref || undefined,
      isExternal: true,
    });
  }

  const [primaryDetail, ...secondaryDetails] = contactDetails;

  const featuredCategories = FEATURED_CATEGORY_SLUGS.filter((slug) =>
    categories.some((category) => category.slug === slug)
  ).map((slug) => ({ slug, name: t.categories[slug] }));

  const hasLocation = Boolean(address || mapsHref);
  const hasCategories = featuredCategories.length > 0;

  return (
    <main className="flex-1">
      <PageHeader
        title={contact.pageTitle}
        description={contact.pageDescription}
        breadcrumbs={[{ label: contact.breadcrumb, href: "/contact" }]}
        breadcrumbLinkClassName="text-[1rem] transition-colors duration-200 hover:text-gold-light"
        backgroundImage="/images/contact-hero.png"
        backdropOverlay="bg-[radial-gradient(ellipse_120%_75%_at_50%_-15%,color-mix(in_oklab,var(--navy-dark)_74%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_52%,transparent)_30%,transparent_72%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_92%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_82%,transparent)_22%,color-mix(in_oklab,var(--navy-dark)_64%,transparent)_44%,color-mix(in_oklab,var(--navy-dark)_40%,transparent)_64%,color-mix(in_oklab,var(--navy-dark)_16%,transparent)_84%,transparent_98%)]"
        objectFit="object-cover lg:object-contain"
        noZoom
        textColor="pureWhite"
        exactCenter
        className="lg:min-h-[calc(100dvh-5rem)]"
      />

      {/* ================================================================
          Contact information — warm neutral band with editorial header
          and an asymmetric primary / secondary channel composition.
         ================================================================ */}
      <section className="relative" aria-labelledby="contact-info-heading">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#FAF8F3] dark:bg-[oklch(0.152_0.022_250)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-72 w-72 sm:h-96 sm:w-96"
          style={CORNER_GRID}
        />

        <Container className="relative">
          <div className="section-spacing">
            <Reveal>
              <div className="grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-14">
                <div className="lg:col-span-7">
                  <p className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gold-text">
                    <span className="h-px w-10 bg-gold/70" aria-hidden="true" />
                    {contact.breadcrumb}
                  </p>
                  <h2
                    id="contact-info-heading"
                    className="mt-5 font-heading text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.85rem]"
                  >
                    {cp.contactInfo.title}
                  </h2>
                </div>
                <div className="lg:col-span-5">
                  <p className="max-w-xl border-t border-border/70 pt-5 text-[0.95rem] leading-relaxed text-muted-foreground lg:ml-auto lg:max-w-sm">
                    {cp.contactInfo.description}
                  </p>
                </div>
              </div>
            </Reveal>

            {primaryDetail && (
              <div className="mt-10 grid gap-5 sm:mt-14 lg:grid-cols-12 lg:gap-6">
                <Reveal
                  className={cn(
                    "h-full",
                    secondaryDetails.length > 0 ? "lg:col-span-5" : "lg:col-span-12"
                  )}
                >
                  <PrimaryChannelPanel
                    detail={primaryDetail}
                    index={1}
                    phoneHref={isSet(phone) ? `tel:${phone}` : undefined}
                    whatsappHref={whatsappHref ?? undefined}
                    callLabel={contact.channels.phone.action}
                    whatsappLabel={cp.whatsappCTA.button}
                  />
                </Reveal>

                {secondaryDetails.length > 0 && (
                  <Reveal delay={0.08} className="h-full lg:col-span-7">
                    <ul
                      className={cn(
                        CARD_SHELL,
                        "h-full overflow-hidden hover:border-gold/30"
                      )}
                    >
                      {secondaryDetails.map((detail, index) => (
                        <li
                          key={detail.key}
                          className={cn(
                            "flex",
                            index > 0 && "border-t border-border/70"
                          )}
                        >
                          <ChannelRow
                            detail={detail}
                            index={index + 2}
                          />
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ================================================================
          Location + categories
         ================================================================ */}
      {(hasLocation || hasCategories) && (
        <Container>
          <div className="grid gap-5 pb-10 sm:pb-12 lg:grid-cols-12 lg:gap-6 lg:pb-16">
            {hasLocation && (
              <Reveal
                className={cn(
                  "h-full",
                  hasCategories ? "lg:col-span-7" : "lg:col-span-12"
                )}
              >
                <LocationPanel
                  address={address}
                  mapsHref={mapsHref}
                  mapsEmbed={mapsEmbed}
                  title={cp.location.title}
                  description={cp.location.description}
                  viewMapLabel="View on Map"
                />
              </Reveal>
            )}

            {hasCategories && (
              <Reveal
                delay={0.08}
                className={cn(
                  "h-full",
                  hasLocation ? "lg:col-span-5" : "lg:col-span-12 lg:max-w-4xl"
                )}
              >
                <CategoriesPanel
                  categories={featuredCategories}
                  title={cp.categories.title}
                  description={cp.categories.description}
                  actionLabel={t.categoryCard.browseProducts}
                />
              </Reveal>
            )}
          </div>
        </Container>
      )}

      {/* ================================================================
          WhatsApp CTA band
         ================================================================ */}
      {whatsappHref && (
        <Container>
          <div className="pb-16 pt-6 sm:pb-20 sm:pt-8 lg:pb-24 lg:pt-10">
            <Reveal>
              <WhatsAppBand
                href={whatsappHref}
                channelLabel={contact.channels.whatsapp.label}
                title={cp.whatsappCTA.title}
                description={cp.whatsappCTA.description}
                buttonText={cp.whatsappCTA.button}
                responseTime={contact.askAnything.responseTime}
              />
            </Reveal>
          </div>
        </Container>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ *
 * Primary channel panel — deep navy, restrained gold
 * ------------------------------------------------------------------ */

function PrimaryChannelPanel({
  detail,
  index,
  phoneHref,
  whatsappHref,
  callLabel,
  whatsappLabel,
}: {
  detail: ContactDetail;
  index: number;
  phoneHref?: string;
  whatsappHref?: string;
  callLabel: string;
  whatsappLabel: string;
}) {
  const Icon = detail.icon;
  const isWhatsApp = detail.key === "whatsapp";

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl",
        "border border-navy/40 bg-navy-dark text-white",
        "shadow-[0_1px_2px_rgba(4,12,28,0.20),0_24px_50px_-34px_rgba(4,12,28,0.85)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-[0_1px_2px_rgba(4,12,28,0.20),0_30px_56px_-34px_rgba(4,12,28,0.9)]"
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={DARK_GRID}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold/10 blur-3xl transition-colors duration-500 group-hover:bg-gold/[0.16]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/70 via-gold/20 to-transparent"
      />

      <div className="relative flex h-full flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3.5">
            <span
              className={cn(ICON_SHELL, isWhatsApp ? ICON_ON_DARK_GREEN : ICON_ON_DARK)}
            >
              <Icon className="size-[1.15rem]" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span
              className={cn(
                LABEL_MICRO,
                "text-white/60 group-hover:text-white/80"
              )}
            >
              {detail.label}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 font-heading text-[0.7rem] font-semibold tabular-nums tracking-[0.22em] text-gold-light/60"
          >
            {indexLabel(index)}
          </span>
        </div>

        <p className="mt-7 break-words font-heading text-[1.6rem] font-semibold leading-[1.15] tracking-[-0.015em] text-white sm:text-[2rem]">
          {detail.value}
        </p>

        {(phoneHref || whatsappHref) && (
          <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:flex-wrap sm:items-center">
            {phoneHref && (
              <a href={phoneHref} className={cn(BTN, BTN_CALL)}>
                <Phone className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                {callLabel}
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(BTN, BTN_WHATSAPP)}
              >
                <MessageCircle className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                {whatsappLabel}
                <ArrowUpRight
                  className="size-3.5 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Secondary channel row — hairline list with accent reveal
 * ------------------------------------------------------------------ */

function ChannelRow({
  detail,
  index,
}: {
  detail: ContactDetail;
  index: number;
}) {
  const Icon = detail.icon;
  const isWhatsApp = detail.key === "whatsapp";
  const isClickable = Boolean(detail.href);

  const body = (
    <>
      <span
        aria-hidden="true"
        className="hidden w-7 shrink-0 pt-0.5 font-heading text-[0.66rem] font-semibold tabular-nums tracking-[0.18em] text-gold-text/55 sm:block"
      >
        {indexLabel(index)}
      </span>
      <span
        className={cn(
          ICON_SHELL,
          isWhatsApp ? ICON_GREEN : ICON_GOLD,
          isClickable &&
            (isWhatsApp
              ? "group-hover:border-[#25D366]/55 group-hover:bg-[#25D366]/15"
              : "group-hover:border-gold/50 group-hover:bg-gold/15")
        )}
      >
        <Icon className="size-[1.15rem]" strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            LABEL_MICRO,
            isClickable && !isWhatsApp && "text-muted-foreground group-hover:text-gold-text",
            isClickable && isWhatsApp &&
              "text-muted-foreground group-hover:text-[#0F7B4F] dark:group-hover:text-[#25D366]",
            !isClickable && "text-muted-foreground"
          )}
        >
          {detail.label}
        </span>
        <span className="mt-1.5 block wrap-anywhere text-[0.97rem] font-medium leading-snug text-foreground">
          {detail.value}
        </span>
      </span>
      {isClickable && (
        <ArrowUpRight
          className={cn(
            "mt-1 size-4 shrink-0 text-border transition-all duration-300 ease-out",
            isWhatsApp
              ? "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0F7B4F] dark:group-hover:text-[#25D366]"
              : "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-text"
          )}
          aria-hidden="true"
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100",
          isWhatsApp ? "bg-[#25D366]" : "bg-gold"
        )}
      />
    </>
  );

  const rowClassName = cn(
    "group relative flex w-full items-center gap-4 px-5 py-5 text-left transition-colors duration-300 ease-out sm:gap-5 sm:px-7 sm:py-6",
    isClickable
      ? "cursor-pointer hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/40"
      : ""
  );

  if (!detail.href) {
    return <div className={rowClassName}>{body}</div>;
  }

  return (
    <a
      href={detail.href}
      {...(detail.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={rowClassName}
    >
      {body}
    </a>
  );
}

/* ------------------------------------------------------------------ *
 * Location panel — framed map as the visual anchor
 * ------------------------------------------------------------------ */

function LocationPanel({
  address,
  mapsHref,
  mapsEmbed,
  title,
  description,
  viewMapLabel,
}: {
  address: string;
  mapsHref?: string;
  mapsEmbed?: string;
  title: string;
  description: string;
  viewMapLabel: string;
}) {
  return (
    <section
      className={cn(
        CARD_SHELL,
        "group flex h-full flex-col overflow-hidden hover:border-gold/35 hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_28px_54px_-32px_rgba(16,24,40,0.38)]"
      )}
      aria-labelledby="contact-location-heading"
    >
      <div className="flex items-start gap-4 border-b border-border/70 px-6 py-6 sm:px-8 sm:py-7">
        <span
          className={cn(
            ICON_SHELL,
            ICON_GOLD,
            "group-hover:border-gold/45 group-hover:bg-gold/15"
          )}
        >
          <MapPin className="size-[1.15rem]" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3
            id="contact-location-heading"
            className="font-heading text-lg font-semibold tracking-[-0.01em] text-foreground sm:text-xl"
          >
            {title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div
        className="relative min-h-[200px] flex-1 overflow-hidden sm:min-h-[240px] lg:min-h-[300px]"
        style={MAP_BLUEPRINT}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="relative flex size-12 items-center justify-center rounded-full border border-gold/55 bg-gold/25 text-gold-text">
            <span className="absolute -inset-3 rounded-full border border-gold/30" />
            <span className="absolute -inset-6 rounded-full border border-gold/15" />
            <MapPin className="size-5" strokeWidth={1.7} />
          </span>
        </div>
        {mapsEmbed ? (
          <iframe
            title="Google Maps"
            src={mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 brightness-100 saturate-[0.88] transition-all duration-500 ease-out group-hover:saturate-100 dark:brightness-90"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/25 to-transparent"
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-border/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
        {address ? (
          <p className="flex min-w-0 items-start gap-3 text-sm leading-relaxed text-foreground">
            <span
              aria-hidden="true"
              className="mt-2 h-8 w-px shrink-0 bg-gold/60"
            />
            <span className="break-words">{address}</span>
          </p>
        ) : (
          <span />
        )}
        {mapsHref && (
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={cn(BTN, BTN_MAP, "shrink-0")}>
            <ArrowUpRight
              className="size-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              aria-hidden="true"
            />
            {viewMapLabel}
          </a>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Categories panel — index rows instead of tiles
 * ------------------------------------------------------------------ */

function CategoriesPanel({
  categories,
  title,
  description,
  actionLabel,
}: {
  categories: Array<{ slug: string; name: string }>;
  title: string;
  description: string;
  actionLabel: string;
}) {
  return (
    <section
      className={cn(
        CARD_SHELL,
        "group flex h-full flex-col p-6 hover:border-gold/35 hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_28px_54px_-32px_rgba(16,24,40,0.38)] sm:p-8"
      )}
      aria-labelledby="contact-categories-heading"
    >
      <header>
        <span
          className={cn(
            ICON_SHELL,
            ICON_GOLD,
            "group-hover:border-gold/45 group-hover:bg-gold/15"
          )}
        >
          <LayoutGrid
            className="size-[1.15rem]"
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </span>
        <h3
          id="contact-categories-heading"
          className="mt-5 font-heading text-lg font-semibold tracking-[-0.01em] text-foreground sm:text-xl"
        >
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>

      <ul className="mt-6 flex-1 border-y border-border/70">
        {categories.map((category) => (
          <li key={category.slug} className="border-b border-border/70 last:border-b-0">
            <Link
              href={`/products?category=${category.slug}`}
              className="group/row relative flex items-center gap-4 py-4 transition-colors duration-300 ease-out hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/40"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-gold transition-transform duration-300 ease-out group-hover/row:scale-y-100"
              />
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-gold-text transition-all duration-300 ease-out",
                  "group-hover/row:border-gold/45 group-hover/row:bg-gold/10"
                )}
              >
                {getCategoryIconElement(category.slug, {
                  className: "size-[1.05rem]",
                  strokeWidth: 1.7,
                  "aria-hidden": true,
                })}
              </span>
              <span className="min-w-0 flex-1 font-heading text-[0.97rem] font-semibold tracking-[-0.005em] text-foreground transition-colors duration-300 group-hover/row:text-gold-text">
                {category.name}
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-border transition-all duration-300 ease-out group-hover/row:translate-x-1 group-hover/row:text-gold-text"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Link href="/products" className={cn(BTN, BTN_CATALOGUE, "sm:w-auto")}>
          {actionLabel}
          <ArrowRight
            className="size-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * WhatsApp CTA band
 * ------------------------------------------------------------------ */

function WhatsAppBand({
  href,
  channelLabel,
  title,
  description,
  buttonText,
  responseTime,
}: {
  href: string;
  channelLabel: string;
  title: string;
  description: string;
  buttonText: string;
  responseTime: string;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-navy/50 bg-navy-dark text-white shadow-[0_2px_4px_rgba(4,12,28,0.25),0_36px_70px_-46px_rgba(4,12,28,0.9)]"
      aria-labelledby="contact-whatsapp-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={DARK_GRID}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 size-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-10 size-56 rounded-full bg-[#25D366]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/60 via-white/12 to-transparent"
      />

      <div className="relative flex flex-col gap-9 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:p-14">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gold-light">
            <span className="h-px w-10 bg-gold/70" aria-hidden="true" />
            {channelLabel}
          </p>
          <h2
            id="contact-whatsapp-heading"
            className="mt-4 font-heading text-2xl font-bold leading-[1.14] tracking-[-0.02em] text-white sm:text-3xl lg:text-[2.5rem]"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {description}
          </p>
          <p className="mt-6 flex items-center gap-2.5 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/55">
            <Clock className="size-3.5 shrink-0 text-gold-light/80" strokeWidth={1.8} aria-hidden="true" />
            {responseTime}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col xl:flex-row">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(BTN, BTN_WHATSAPP, "lg:px-7")}
          >
            <MessageCircle className="size-[1.1rem] shrink-0" strokeWidth={1.9} aria-hidden="true" />
            {buttonText}
            <ArrowUpRight
              className="size-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
