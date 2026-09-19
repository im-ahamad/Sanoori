"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { navigationConfig, businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  const whatsappHref = buildWhatsAppLink(GENERAL_ENQUIRY_MESSAGE);
  const showWhatsApp = Boolean(whatsappHref);
  const showPhone = !isConfigPlaceholder(businessConfig.phone);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        id="mobile-nav-panel"
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-xl outline-none transition-[transform,visibility] duration-300 ease-in-out motion-reduce:transition-none lg:hidden",
          open ? "visible translate-x-0" : "invisible translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Link
              href="/"
              onClick={onClose}
              aria-label={`${businessConfig.name} — Home`}
              className="flex items-center"
            >
              <Brand size="sm" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-6" aria-label="Mobile navigation">
            <ul className="space-y-1">
              {navigationConfig.main.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-accent text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-4 border-t border-border px-6 py-6">
            <Button
              render={<Link href={navigationConfig.cta.href} onClick={onClose} />}
              className="w-full"
              size="lg"
            >
              {navigationConfig.cta.label}
            </Button>
            {(showWhatsApp || showPhone) && (
              <div className="flex items-center justify-center gap-5 text-sm text-muted-foreground">
                {showWhatsApp && (
                  <a
                    href={whatsappHref ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                )}
                {showPhone && (
                  <a
                    href={`tel:${businessConfig.phone}`}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {businessConfig.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}