"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { businessConfig } from "@/config/site";
import { logoutAction } from "@/lib/actions/auth";
import { adminNavItems } from "@/lib/admin/nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  user: { name: string | null; email: string | null };
  children: React.ReactNode;
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <div className="relative h-9 w-9 overflow-hidden rounded">
        <Image
          src={businessConfig.logo.src}
          alt={businessConfig.logo.alt}
          fill
          sizes="36px"
          className="object-contain"
        />
      </div>
      <div className="leading-tight">
        <span className="block font-heading text-base font-bold tracking-tight">
          Sanoori
        </span>
        <span className="block text-[0.6rem] font-medium uppercase tracking-widest text-foreground/60">
          Trading · Admin
        </span>
      </div>
    </Link>
  );
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction} className={className}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="w-full justify-start text-foreground/75 hover:text-foreground"
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </form>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {adminNavItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
              active
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="size-4 shrink-0 text-gold" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.status === "soon" && (
              <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white/50">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName =
    user.name ?? (user.email ? user.email.split("@")[0] : "Administrator");

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      {/* ===== Top header ===== */}
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" />
            </Button>
            <Brand />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              View website
            </Link>

            <div className="hidden text-right leading-tight md:block">
              <p className="text-sm font-semibold text-foreground">
                {displayName}
              </p>
              {user.email ? (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>

            <div className="hidden sm:block">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* ===== Desktop sidebar ===== */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-navy-dark lg:flex">
          <div className="sticky top-14 flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <NavLinks />
            <div className="mt-auto border-t border-white/10 pt-4">
              <LogoutButton className="text-white/70" />
            </div>
          </div>
        </aside>

        {/* ===== Main content ===== */}
        <main className="min-w-0 flex-1" id="admin-content">
          {children}
        </main>
      </div>

      {/* ===== Mobile drawer ===== */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation menu"
        >
          <div
            className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-navy-dark p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="mt-6 flex-1">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="mb-3 px-3 text-sm font-semibold text-white">
                {displayName}
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ExternalLink className="size-4 shrink-0 text-gold" />
                  View website
                </Link>
                <LogoutButton className="text-white/70" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}