"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { isConfigPlaceholder } from "@/lib/config";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/language/language-toggle";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PublicBusinessSettings } from "@/lib/public/settings";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  settings: PublicBusinessSettings;
}

export function MobileNav({ open, onClose, settings }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useTranslations();

  const navigationConfig = {
    main: [
      { label: t.mobileNav.navigation.home, href: "/" },
      { label: t.mobileNav.navigation.about, href: "/about" },
      { label: t.mobileNav.navigation.products, href: "/products" },
      { label: t.mobileNav.navigation.contact, href: "/contact" },
    ] as const,
    cta: {
      label: t.mobileNav.cta,
      href: "/products",
    },
  } as const;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Remember where focus was so we can restore it on close.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus into the panel on open.
    panelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      // Trap Tab/Shift+Tab inside the panel so focus never escapes behind
      // the modal overlay.
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the element that opened the menu (unless it is gone).
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, onClose]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const whatsappHref = buildWhatsAppLink(settings, GENERAL_ENQUIRY_MESSAGE);
  const showWhatsApp = Boolean(whatsappHref);
  const showPhone = !isConfigPlaceholder(settings.phone);
  const showContactLinks = showWhatsApp || showPhone;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        id="mobile-nav-panel"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl outline-none transition-[transform,visibility] duration-300 ease-in-out motion-reduce:transition-none lg:hidden",
          open ? "visible translate-x-0" : "invisible translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t.mobileNav.ariaLabel}
        aria-hidden={!open}
      >
        {/* Brand accent line */}
        <div className="h-0.5 shrink-0 bg-gold" aria-hidden="true" />

        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <Link
            href="/"
            onClick={onClose}
            aria-label={t.mobileNav.brandHome.replace("{name}", settings.name)}
            className="flex items-center"
          >
            <Brand size="sm" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            onClick={onClose}
            aria-label={t.mobileNav.closeMenu}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Primary CTA — immediately visible */}
        <div className="border-b border-border px-5 py-4">
          <Button
            render={<Link href={navigationConfig.cta.href} onClick={onClose} />}
            variant="secondary"
            className="h-11 w-full text-base"
          >
            {navigationConfig.cta.label}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t.mobileNav.ariaLabel}>
          <ul className="space-y-1">
            {navigationConfig.main.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={`mobile-${item.href}`}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-accent text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-5 w-1 rounded-full bg-gold transition-opacity",
                        active ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Preferences — theme + language (mobile) */}
        <div className="space-y-3 border-t border-border px-5 py-4">
          <ThemeToggle variant="panel" />
          <LanguageToggle variant="panel" />
        </div>

        {/* Contact footer */}
        <div className="space-y-4 border-t border-border px-5 py-5">
          {showContactLinks && (
            <div className="flex items-center justify-center gap-5 text-sm text-muted-foreground">
              {showWhatsApp && (
                <a
                  href={whatsappHref ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t.mobileNav.whatsapp}
                </a>
              )}
              {showPhone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {settings.phone}
                </a>
              )}
            </div>
          )}
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t.mobileNav.tagline}
          </p>
        </div>
      </div>
    </>
  );
}