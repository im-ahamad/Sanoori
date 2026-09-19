import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig, businessConfig, navigationConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { Brand } from "@/components/shared/brand";
import { Container } from "@/components/layout/container";
import { getPublicCategories } from "@/lib/public/catalogue";

const socialLinks = [
  { label: "Facebook", href: businessConfig.social.facebook },
  { label: "Instagram", href: businessConfig.social.instagram },
  { label: "Telegram", href: businessConfig.social.telegram },
  { label: "TikTok", href: businessConfig.social.tiktok },
  { label: "YouTube", href: businessConfig.social.youtube },
];

export async function Footer() {
  const categories = await getPublicCategories();
  const currentYear = new Date().getFullYear();
  const whatsappHref = buildWhatsAppLink(GENERAL_ENQUIRY_MESSAGE);

  const showWhatsApp = Boolean(whatsappHref);
  const showPhone = !isConfigPlaceholder(businessConfig.phone);
  const showEmail = !isConfigPlaceholder(businessConfig.email);
  const showAddress = !isConfigPlaceholder(businessConfig.address);
  const showCity = !isConfigPlaceholder(businessConfig.city);
  const hasContactInfo = showWhatsApp || showPhone || showEmail || showAddress;

  return (
    <footer className="border-t border-border bg-muted/30">
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
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navigationConfig.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={navigationConfig.cta.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {navigationConfig.cta.label}
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Products
            </h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact Us
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
                    WhatsApp
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
                  Contact details will be published here soon.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} {businessConfig.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {showCity && (
                <span className="text-xs text-muted-foreground">
                  {businessConfig.city}, {businessConfig.country}
                </span>
              )}
              <ul className="flex items-center gap-4">
                {socialLinks.map((social) =>
                  !isConfigPlaceholder(social.href) ? (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {social.label}
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