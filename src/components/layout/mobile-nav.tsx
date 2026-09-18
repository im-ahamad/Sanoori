"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, Phone } from "lucide-react";
import { navigationConfig, businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
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
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose]);

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
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-xl transition-[transform,visibility] duration-300 ease-in-out lg:hidden",
          open ? "visible translate-x-0" : "invisible translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-heading text-xs font-bold">
                ST
              </div>
              <span className="font-heading text-base font-bold">Sanoori</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-6" aria-label="Mobile navigation">
            <ul className="space-y-1">
              {navigationConfig.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border px-6 py-6 space-y-4">
            <Button
              render={<Link href={navigationConfig.cta.href} onClick={onClose} />}
              className="w-full"
              size="lg"
            >
              {navigationConfig.cta.label}
            </Button>
            {showPhone && (
              <a
                href={`tel:${businessConfig.phone}`}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Phone className="size-4" />
                {businessConfig.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}