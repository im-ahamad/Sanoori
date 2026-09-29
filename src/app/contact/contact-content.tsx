"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";
import { getCategoryIconElement } from "@/lib/category-icons";
import { isConfigPlaceholder } from "@/lib/config";
import {
  buildWhatsAppChatLink,
  GENERAL_ENQUIRY_MESSAGE,
} from "@/lib/contact/whatsapp";
import { useTranslations } from "@/lib/i18n";
import { businessConfig } from "@/config/site";
import type { PublicBusinessSettings } from "@/lib/public/settings";

/** The three catalogue categories the site is built around, in display order. */
const FEATURED_CATEGORY_SLUGS = [
  "sanitary-ware",
  "tiles",
  "building-materials",
] as const;

/**
 * Business Settings are admin-editable, but a stored row can still hold
 * `[PLACEHOLDER]` tokens. Fall back per field to the shipped site
 * configuration so this page shows the same real details the rest of the site
 * already publishes, instead of dropping fields that have not been filled in
 * yet. No new information is introduced — both sources are existing project
 * data.
 */
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

  const phone = resolveSetting(businessSettings.phone, businessConfig.phone);
  const whatsapp = resolveSetting(businessSettings.whatsapp, businessConfig.whatsapp);
  const email = resolveSetting(businessSettings.email, businessConfig.email);
  const street = resolveSetting(businessSettings.address, businessConfig.address);
  const city = resolveSetting(businessSettings.city, businessConfig.city);
  const country = resolveSetting(businessSettings.country, businessConfig.country);

  const address = [street, city, country].filter(isSet).join(", ");

  const contactDetails: Array<{
    key: string;
    icon: LucideIcon;
    label: string;
    value: string;
    href?: string;
    isExternal?: boolean;
  }> = [];

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

  // Only surface categories that actually exist in the catalogue.
  const featuredCategories = FEATURED_CATEGORY_SLUGS.filter((slug) =>
    categories.some((category) => category.slug === slug)
  ).map((slug) => ({ slug, name: t.categories[slug] }));

  return (
    <main className="flex-1">
      <PageHeader
        title={contact.pageTitle}
        description={contact.pageDescription}
        breadcrumbs={[{ label: contact.breadcrumb, href: "/contact" }]}
        breadcrumbLinkClassName="text-[1rem] transition-colors duration-200 hover:text-gold-light"
        backgroundImage="/images/contact-hero.png"
        backdropOverlay="bg-[radial-gradient(ellipse_120%_75%_at_50%_-15%,color-mix(in_oklab,var(--navy-dark)_74%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_52%,transparent)_30%,transparent_72%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_92%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_82%,transparent)_22%,color-mix(in_oklab,var(--navy-dark)_64%,transparent)_44%,color-mix(in_oklab,var(--navy-dark)_40%,transparent)_64%,color-mix(in_oklab,var(--navy-dark)_16%,transparent)_84%,transparent_98%)]"
        objectFit="object-contain"
        noZoom
        textColor="pureWhite"
        exactCenter
        className="min-h-[calc(100vw/3)]"
      />

      {/* Contact information */}
      <Container>
        <section className="section-spacing-sm">
          <SectionHeader
            title={cp.contactInfo.title}
            description={cp.contactInfo.description}
          />

          {contactDetails.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {contactDetails.map((detail, index) => {
                const { key, ...props } = detail;
                return (
                  <Reveal key={key} delay={index * 0.1} className="h-full">
                    <ContactDetailCard key={key} {...props} />
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      </Container>

      {/* Location & Product Categories */}
      {((address || mapsHref) || featuredCategories.length > 0) && (
        <Container>
          <section className="section-spacing-sm grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Find Us */}
            {(address || mapsHref) && (
              <Reveal className="h-full">
                <section
                  className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
                  aria-labelledby="contact-location-heading"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <MapPin className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3
                    id="contact-location-heading"
                    className="mt-5 font-heading text-lg font-semibold tracking-tight text-foreground"
                  >
                    {cp.location.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cp.location.description}
                  </p>
                  {address && (
                    <AddressLine address={address} mapsHref={mapsHref} />
                  )}
                </section>
              </Reveal>
            )}

            {/* Product Categories */}
            {featuredCategories.length > 0 && (
              <Reveal delay={0.1} className="h-full">
                <section
                  className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
                  aria-labelledby="contact-categories-heading"
                >
                  <h3
                    id="contact-categories-heading"
                    className="font-heading text-lg font-semibold tracking-tight text-foreground"
                  >
                    {cp.categories.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cp.categories.description}
                  </p>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {featuredCategories.map((category, index) => (
                      <Reveal key={category.slug} delay={index * 0.1} className="h-full">
                        <CategoryTile
                          slug={category.slug}
                          name={category.name}
                          actionLabel={t.categoryCard.browseProducts}
                        />
                      </Reveal>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}
          </section>
        </Container>
      )}

      {/* WhatsApp call to action */}
      {whatsappHref && (
        <Container>
          <section
            className="pb-16 sm:pb-20 lg:pb-24"
            aria-labelledby="contact-whatsapp-heading"
          >
            <div className="relative overflow-hidden rounded-2xl bg-navy-dark/90 px-6 py-12 text-white shadow-sm sm:px-12 sm:py-14">
              <VisualBackdrop variant="band" objectPosition="object-top" />
              <div className="relative flex flex-col items-start gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <div className="max-w-xl">
                  <h2
                    id="contact-whatsapp-heading"
                    className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
                  >
                    {cp.whatsappCTA.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-white/75">
                    {cp.whatsappCTA.description}
                  </p>
                </div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-[#25D366] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#1fb958] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-navy-dark"
                >
                  <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  {cp.whatsappCTA.button}
                </a>
              </div>
            </div>
          </section>
        </Container>
      )}
    </main>
  );
}

function ContactDetailCard({
  icon: Icon,
  label,
  value,
  href,
  isExternal = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  isExternal?: boolean;
}) {
  const className =
    "flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const body = (
    <>
      <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-2 block text-sm font-semibold leading-relaxed break-words text-foreground">
        {value}
      </span>
    </>
  );

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {body}
    </a>
  );
}

function AddressLine({
  address,
  mapsHref,
}: {
  address: string;
  mapsHref: string;
}) {
  if (!mapsHref) {
    return (
      <p className="mt-4 text-sm font-medium leading-relaxed text-foreground">
        {address}
      </p>
    );
  }

  return (
    <a
      href={mapsHref}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-4 inline-flex items-start gap-2 text-sm font-medium leading-relaxed text-foreground transition-colors hover:text-gold-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
    >
      {address}
      <ArrowUpRight
        className="mt-0.5 size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

function CategoryTile({
  slug,
  name,
  actionLabel,
}: {
  slug: string;
  name: string;
  actionLabel: string;
}) {
  return (
    <Link
      href={`/products?category=${slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
        {getCategoryIconElement(slug, {
          className: "size-6",
          strokeWidth: 1.75,
          "aria-hidden": true,
        })}
      </span>
      <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight text-foreground">
        {name}
      </h3>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-text transition-colors group-hover:text-gold-dark">
        {actionLabel}
        <ArrowRight
          className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}