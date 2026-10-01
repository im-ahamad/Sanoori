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
 * Single-line header navigation.
 *
 * Every link stays directly visible at every breakpoint (no drawer, no
 * hamburger, no second row) — type scale, padding and gaps simply shrink as
 * the viewport narrows so the row always fits.
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
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center whitespace-nowrap rounded-sm px-0.5 py-1 text-[9px] font-medium leading-tight transition-colors min-[400px]:px-1.5 min-[400px]:text-[10px] sm:px-2 sm:text-[12px] lg:px-2.5 lg:py-1.5 lg:text-[13px]",
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
    </Link>
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
              "whitespace-nowrap rounded-full px-1 py-0.5 text-[9px] font-semibold leading-tight transition-colors min-[400px]:px-1.5 min-[400px]:text-[10px] sm:px-2 sm:text-[11px]",
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
          ? "bg-background/95 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.3)] backdrop-blur supports-[backdrop-filter]:bg-background/90"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90"
      )}
    >
      {/* Gold brand accent strip */}
      <div className="h-0.5 w-full bg-gold" aria-hidden="true" />

      {/* ONE horizontal row — logo · nav · theme · language */}
      <Container className="px-2! min-[400px]:px-3! sm:px-6! lg:px-8!">
        <div className="flex h-9 min-[400px]:h-10 sm:h-11 lg:h-12 items-center justify-between gap-1.5 min-[400px]:gap-3 sm:gap-4">
          {/* Logo */}
          <Link
            href="/"
            aria-label={t.header.ariaLabel.home}
            className="flex shrink-0 items-center"
          >
            <Brand
              size="sm"
              className="h-4 min-[400px]:h-5 sm:h-6 lg:h-7 dark:brightness-0 dark:invert"
            />
          </Link>

          {/* Navigation — centred in the free space, all links directly visible */}
          <nav
            className="flex flex-1 items-center justify-center gap-0 min-[400px]:gap-0.5 sm:gap-1 lg:gap-2"
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

          <div className="flex shrink-0 items-center gap-1 min-[400px]:gap-1.5 sm:gap-2">
            {/* Theme toggle — compact */}
            <ThemeToggle className="size-7 min-[400px]:size-8" />
            {/* Language toggle — compact pill */}
            <HeaderLanguageToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
