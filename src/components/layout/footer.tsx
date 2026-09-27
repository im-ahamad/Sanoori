import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { Brand } from "@/components/shared/brand";
import { Container } from "@/components/layout/container";
import { getPublicCategories } from "@/lib/public/catalogue";
import { getServerTranslations, getNavigationConfig } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function Footer() {
  const [lang, categories] = await Promise.all([
    getLang(),
    getPublicCategories(),
  ]);

  const currentYear = new Date().getFullYear();
  const whatsappHref = buildWhatsAppLink(businessConfig, GENERAL_ENQUIRY_MESSAGE);
  const t = getServerTranslations(lang);
  const navigationConfig = getNavigationConfig(lang);

  const showWhatsApp = Boolean(whatsappHref);
  const showPhone = !isConfigPlaceholder(businessConfig.phone);
  const showEmail = !isConfigPlaceholder(businessConfig.email);
  const showAddress = !isConfigPlaceholder(businessConfig.address);
  const showCity = !isConfigPlaceholder(businessConfig.city);
  const hasContactInfo = showWhatsApp || showPhone || showEmail || showAddress;

  const socialLinks = [
    { key: "facebook" as const, href: businessConfig.social.facebook },
    { key: "instagram" as const, href: businessConfig.social.instagram },
    { key: "telegram" as const, href: businessConfig.social.telegram },
    { key: "tiktok" as const, href: businessConfig.social.tiktok },
    { key: "youtube" as const, href: businessConfig.social.youtube },
  ];

  const quickLinks = [
    navigationConfig.main.find((item) => item.href === "/") ??
      navigationConfig.main[0],
    navigationConfig.main.find((item) => item.href === "/about") ?? {
      label: t.header.navigation.about,
      href: "/about",
    },
    navigationConfig.main.find((item) => item.href === "/contact") ?? {
      label: t.header.navigation.contact,
      href: "/contact",
    },
    navigationConfig.cta,
  ];

  return (
    <footer className="border-t border-border bg-background/95">
      <Container>
        <div className="section-spacing-sm grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={`${businessConfig.name} — Home`}
              className="inline-flex items-center"
            >
              <Brand size="md" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div className="w-fit">
              <h3 className="-translate-x-[16px] text-center font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                {t.footer.quickLinks}
              </h3>
              <ul className="mt-2 grid w-fit grid-cols-2 gap-x-1 gap-y-2">
                {quickLinks.map((item) => (
                  <li key={`footer-${item.href}`}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              {t.footer.products}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {t.categories[category.slug as keyof typeof t.categories] ?? category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              {t.footer.contactUs}
            </h3>
            <ul className="mt-4 space-y-3">
              {showWhatsApp && (
                <li>
                  <a
                    href={whatsappHref ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {t.common.whatsapp}
                  </a>
                </li>
              )}
              {showPhone && (
                <li>
<a
                      href={`tel:${businessConfig.phone}`}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {businessConfig.phone}
                    </a>
                </li>
              )}
              {showEmail && (
                <li>
<a
                      href={`mailto:${businessConfig.email}`}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {businessConfig.email}
                    </a>
                </li>
              )}
              {showAddress && (
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{businessConfig.address}</span>
                </li>
              )}
              {!hasContactInfo && (
                <li className="text-sm text-muted-foreground">
                  {t.footer.contactDetailsComing}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:col-start-2">
              <p className="text-xs text-muted-foreground">
                {t.footer.copyright.replace("{year}", currentYear.toString())}
              </p>
              <Link
                href="/privacy-policy"
                className="text-xs text-gold-text transition-colors hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {t.footer.privacyPolicy}
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:col-start-3 sm:justify-end">
              {showCity && (
                <span className="text-xs text-muted-foreground">
                  {t.footer.cityCountry.replace("{city}", businessConfig.city || "").replace("{country}", businessConfig.country || "")}
                </span>
              )}
              <ul className="flex items-center gap-4">
                {socialLinks.map((social) =>
                  !isConfigPlaceholder(social.href) ? (
                    <li key={social.key}>
                      <a
                        href={social.href || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {t.footer.social[social.key]}
                      </a>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}