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

  const headingClass =
    "relative w-fit pb-2.5 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-dark dark:text-stone-100";
  const ruleClass =
    "absolute bottom-0 left-0 h-px w-7 bg-gold/80";
  const linkClass =
    "inline-block text-sm text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm";
  const contactClass =
    "group flex items-start gap-2.5 text-sm text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm";
  const iconClass =
    "mt-0.5 size-4 shrink-0 text-gold/90 transition-colors group-hover:text-gold-dark dark:group-hover:text-gold";
  // Break opportunities before and after "@" so the address wraps at a
  // readable point instead of mid-word when its column is narrow (mobile).
  const emailAt = businessConfig.email.indexOf("@");
  const hasEmailParts = emailAt > 0 && emailAt < businessConfig.email.length - 1;

  return (
    <footer className="relative border-t border-stone-200 bg-[#F8F5F0] text-stone-800 dark:border-white/10 dark:bg-[#1B1713] dark:text-stone-200">
      {/* Hairline accent — echoes the gold strip above the header */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/70 via-gold/25 to-transparent"
      />

      <Container>
        {/* ===== UPPER LEVEL — Brand · Quick Links · Products · Contact =====
            Mobile (<sm): compact two-column rows —
            brand spans both columns, Quick Links | Products sit side by side,
            Contact spans both columns and lays its four items out in two
            columns (WhatsApp | Phone, Email | Address).
            sm+ layouts are unchanged. */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 py-8 sm:gap-x-8 sm:gap-y-10 sm:py-12 lg:grid-cols-12 lg:gap-6 lg:py-14">
          {/* Brand */}
          <div className="col-span-2 sm:col-auto lg:col-span-4 lg:pr-6">
            <Link
              href="/"
              aria-label={`${businessConfig.name} — Home`}
              className="inline-flex items-center"
            >
              <Brand size="md" className="dark:brightness-0 dark:invert" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:border-l lg:border-stone-300/60 lg:pl-6 dark:lg:border-white/10">
            <h3 className={headingClass}>
              {t.footer.quickLinks}
              <span className={ruleClass} aria-hidden="true" />
            </h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((item) => (
                <li key={`footer-${item.href}`}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="border-l border-stone-300/60 pl-4 sm:border-l-0 sm:pl-0 lg:col-span-2 lg:border-l lg:border-stone-300/60 lg:pl-6 dark:border-white/10">
            <h3 className={headingClass}>
              {t.footer.products}
              <span className={ruleClass} aria-hidden="true" />
            </h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className={linkClass}
                  >
                    {t.categories[category.slug as keyof typeof t.categories] ?? category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — mobile: spans both columns with a 2-column list
              (WhatsApp | Phone, Email | Address); sm+ unchanged */}
          <div className="col-span-2 border-t border-stone-300/60 pt-6 sm:col-auto sm:border-t-0 sm:pt-0 lg:col-span-4 lg:border-l lg:border-stone-300/60 lg:pl-6 dark:border-white/10">
            <h3 className={headingClass}>
              {t.footer.contactUs}
              <span className={ruleClass} aria-hidden="true" />
            </h3>
            <ul className="mt-4 grid grid-cols-2 items-start gap-x-4 gap-y-3 sm:block sm:space-y-3">
              {showWhatsApp && (
                <li>
                  <a
                    href={whatsappHref ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={contactClass}
                  >
                    <MessageCircle className={iconClass} aria-hidden="true" />
                    <span className="min-w-0 break-words">{t.common.whatsapp}</span>
                  </a>
                </li>
              )}
              {showPhone && (
                <li>
                  <a href={`tel:${businessConfig.phone}`} className={contactClass}>
                    <Phone className={iconClass} aria-hidden="true" />
                    <span className="min-w-0 break-words">{businessConfig.phone}</span>
                  </a>
                </li>
              )}
              {showEmail && (
                <li>
                  <a href={`mailto:${businessConfig.email}`} className={contactClass}>
                    <Mail className={iconClass} aria-hidden="true" />
                    <span className="min-w-0 break-words">
                      {hasEmailParts ? (
                        <>
                          {businessConfig.email.slice(0, emailAt)}
                          <wbr />
                          {"@"}
                          <wbr />
                          {businessConfig.email.slice(emailAt + 1)}
                        </>
                      ) : (
                        businessConfig.email
                      )}
                    </span>
                  </a>
                </li>
              )}
              {showAddress && (
                <li className="flex items-start gap-2.5 text-sm text-stone-600 dark:text-stone-400">
                  <MapPin className={iconClass} aria-hidden="true" />
                  <span className="min-w-0 break-words">{businessConfig.address}</span>
                </li>
              )}
              {!hasContactInfo && (
                <li className="text-sm text-stone-600 dark:text-stone-400">
                  {t.footer.contactDetailsComing}
                </li>
              )}
            </ul>
          </div>
        </div>
      </Container>

      {/* ===== LOWER LEVEL — Copyright · Privacy · City · Social ===== */}
      <div className="border-t border-stone-200 bg-[#F1EBE1] dark:border-white/10 dark:bg-[#161310]">
        <Container>
          <div className="flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.footer.copyright.replace("{year}", currentYear.toString())}
              </p>
              <Link
                href="/privacy-policy"
                className="text-xs text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
              >
                {t.footer.privacyPolicy}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 sm:justify-end">
              {showCity && (
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {t.footer.cityCountry.replace("{city}", businessConfig.city || "").replace("{country}", businessConfig.country || "")}
                </span>
              )}
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                {socialLinks.map((social) =>
                  !isConfigPlaceholder(social.href) ? (
                    <li key={social.key}>
                      <a
                        href={social.href || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                      >
                        {t.footer.social[social.key]}
                      </a>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
