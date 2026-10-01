"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/language/language-toggle";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

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
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[85vw] max-w-sm flex-col bg-background shadow-2xl outline-none transition-[transform,visibility] duration-300 ease-in-out motion-reduce:transition-none lg:hidden",
          open ? "visible translate-x-0" : "invisible translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t.mobileNav.ariaLabel}
        aria-hidden={!open}
      >
        {/* Close */}
        <div className="flex items-center justify-end border-b border-border px-4 py-3">
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

        {/* Preferences — theme + language only */}
        <div className="flex-1 space-y-6 px-5 py-6">
          <ThemeToggle variant="panel" />
          <LanguageToggle variant="panel" />
        </div>
      </div>
    </>
  );
}
