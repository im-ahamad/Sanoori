"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { navigationConfig, businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-primary-foreground font-heading text-sm font-bold lg:h-10 lg:w-10">
              ST
            </div>
            <div className="hidden sm:block">
              <span className="block font-heading text-lg font-bold leading-tight tracking-tight text-foreground">
                Sanoori
              </span>
              <span className="block text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
                Trading
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navigationConfig.main.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Phone - visible on tablet+ once configured */}
            {!isConfigPlaceholder(businessConfig.phone) && (
              <a
                href={`tel:${businessConfig.phone}`}
                className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
              >
                <Phone className="size-4" />
                <span className="hidden lg:inline">{businessConfig.phone}</span>
              </a>
            )}

            {/* CTA Button */}
            <Button
              render={<Link href={navigationConfig.cta.href} />}
              className="hidden lg:inline-flex"
              size="lg"
            >
              {navigationConfig.cta.label}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </header>
  );
}
