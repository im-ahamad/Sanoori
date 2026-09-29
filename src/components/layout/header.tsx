"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/layout/container";
import { Brand } from "@/components/shared/brand";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/language/language-toggle";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PublicBusinessSettings } from "@/lib/public/settings";

interface HeaderProps {
  settings: PublicBusinessSettings;
}

function DesktopNavLink({
  href,
  label,
  active,
  emphasize,
}: {
  href: string;
  label: string;
  active: boolean;
  /** Marks the catalogue as the site's primary destination. */
  emphasize?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center rounded-sm px-3 py-2 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold transition-[transform,opacity] duration-300 ease-out",
          active
            ? "scale-x-100 opacity-100"
            : emphasize
            ? "scale-x-100 opacity-40 group-hover:opacity-100"
            : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
        )}
      />
    </Link>
  );
}

export function Header({ settings }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  const navigationConfig = {
    main: [
      { label: t.header.navigation.home, href: "/" },
      { label: t.header.navigation.about, href: "/about" },
      { label: t.header.navigation.products, href: "/products" },
      { label: t.header.navigation.contact, href: "/contact" },
    ] as const,
    cta: {
      label: t.header.cta,
      href: "/products",
    },
  } as const;

  useLayoutEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[box-shadow,background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-border bg-background/95 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.3)] backdrop-blur supports-[backdrop-filter]:bg-background/90"
          : "border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            aria-label={t.header.ariaLabel.home}
            className="flex items-center"
          >
            <Brand size="md" className="lg:h-10" />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-0.5 lg:flex"
            aria-label="Main navigation"
          >
            {navigationConfig.main.map((item) => (
              <DesktopNavLink
                key={`header-${item.href}`}
                href={item.href}
                label={item.label}
                active={isActive(item.href)}
                emphasize={item.href === "/products"}
              />
            ))}
          </nav>

          {/* Right side — Logo → Nav → Theme → Language → CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop header controls — hidden on mobile to keep header uncluttered */}
            <div className="hidden items-center gap-2 sm:flex">
              <ThemeToggle />
              <LanguageToggle />
              <span
                className="hidden h-6 w-px bg-border sm:block"
                aria-hidden="true"
              />
            </div>

            <ButtonLink
              href={navigationConfig.cta.href}
              variant="inverse"
              size="md"
              className="focus-visible:ring-offset-background min-w-[160px]"
            >
              {navigationConfig.cta.label}
            </ButtonLink>

            {/* Mobile menu toggle */}
            <Button
              variant="outline"
              size="icon"
              className="size-10 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label={t.header.ariaLabel.openMenu}
              aria-haspopup="dialog"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        settings={settings}
      />
    </header>
  );
}