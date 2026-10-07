"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLanguage, languageMeta, type SupportedLanguage } from "@/lib/language";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Header navigation.
 *
 * Every link stays directly visible at every breakpoint (no drawer, no
 * hamburger, no hidden menu). Below `sm` the row wraps onto two compact
 * lines — logo · theme · language on the first line, the nav links centred
 * on the second — so the header always fits the viewport at a readable
 * label size. From `sm` up it is the original single line.
 */
function NavLink({
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
  const isHome = href === "/";
  const Component = isHome ? "a" : Link;
  const linkProps = isHome ? { href } : { href, prefetch: false };

  return (
    <Component
      {...linkProps}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center whitespace-nowrap rounded-sm px-0.5 py-1 text-[12px] font-medium leading-tight transition-colors min-[400px]:px-1.5 sm:px-2 sm:text-[13px] lg:px-2.5 lg:py-1.5 lg:text-[14px]",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-gold transition-[transform,opacity] duration-300 ease-out",
          active
            ? "scale-x-100 opacity-100"
            : emphasize
            ? "scale-x-100 opacity-40 group-hover:opacity-100"
            : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
        )}
      />
    </Component>
  );
}

/** Compact EN | বাংলা segmented pill — keeps language switching one tap away. */
function HeaderLanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center rounded-full border border-border/80 bg-muted/40 p-0.5"
      role="group"
      aria-label="Language"
    >
      {(["en", "bn"] as SupportedLanguage[]).map((lang) => {
        const active = language === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            aria-pressed={active}
            className={cn(
              "whitespace-nowrap rounded-full px-1 py-1.5 text-[10px] font-semibold leading-tight transition-colors min-[400px]:px-1.5 min-[400px]:text-[11px] sm:px-2 sm:py-0.5 sm:text-[12px]",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {languageMeta[lang].nativeLabel}
          </button>
        );
      })}
    </div>
  );
}

export function Header() {
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
        "sticky top-0 z-50 w-full border-b border-border/60 transition-[box-shadow,background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "bg-[#E8E2D8] shadow-[0_6px_24px_-12px_rgba(0,0,0,0.3)] backdrop-blur supports-[backdrop-filter]:bg-[#E8E2D8] dark:bg-[oklch(0.19_0.02_250)] dark:shadow-[0_6px_24px_-12px_rgba(0,0,0,0.4)]"
          : "bg-[#E8E2D8] backdrop-blur supports-[backdrop-filter]:bg-[#E8E2D8] dark:bg-[oklch(0.21_0.02_250)]"
      )}
    >
      {/* Gold brand accent strip */}
      <div className="h-0.5 w-full bg-gold" aria-hidden="true" />

      {/* Mobile: logo · theme · language on line 1, nav on line 2.
          sm and up: one line — logo · nav · theme · language. */}
      <Container className="px-2! min-[400px]:px-3! sm:px-6! lg:px-8!">
        <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1 py-1.5 min-[400px]:gap-x-3 sm:h-13 sm:flex-nowrap sm:gap-x-4 sm:py-0 lg:h-15">
          {/* Logo */}
          <a
            href="/"
            aria-label={t.header.ariaLabel.home}
            className="order-1 flex shrink-0 items-center"
          >
            <Brand
              size="md"
              className="h-6 min-[400px]:h-7 sm:h-8 lg:h-9 dark:brightness-0 dark:invert"
            />
          </a>

          {/* Navigation — centred in the free space, all links directly visible */}
          <nav
            className="order-3 flex w-full items-center justify-center gap-1 sm:order-2 sm:w-auto sm:flex-1 lg:gap-2"
            aria-label="Main navigation"
          >
            {navigationConfig.main.map((item) => (
              <NavLink
                key={`header-${item.href}`}
                href={item.href}
                label={item.label}
                active={isActive(item.href)}
                emphasize={item.href === "/products"}
              />
            ))}
          </nav>

          <div className="order-2 flex shrink-0 items-center gap-1 min-[400px]:gap-1.5 sm:order-3 sm:gap-2">
            {/* Theme toggle — compact */}
            <ThemeToggle className="size-8 min-[400px]:size-9" />
            {/* Language toggle — compact pill */}
            <HeaderLanguageToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
