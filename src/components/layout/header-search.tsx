"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

/**
 * Global catalogue search living in the site header.
 *
 * Reuses the existing `/products?q=...` search — the same query the Products
 * page resolves against product name, code, description, category and
 * subcategory. On desktop it expands an inline input next to the trigger; on
 * mobile it unfolds a full-width search row attached to the bottom of the
 * header band. Enter or the submit icon performs the search.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const t = useTranslations();

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Focus the input that is actually visible once the expansion begins.
  useEffect(() => {
    if (!open) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const timer = window.setTimeout(() => {
      const input = isDesktop
        ? desktopInputRef.current
        : mobileInputRef.current;
      input?.focus();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Close on Escape or when the pointer lands outside the header search UI.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;
      if (target?.closest("header")) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function performSearch() {
    const q = query.trim();
    if (!q) {
      setOpen(false);
      return;
    }
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setQuery("");
    setOpen(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    performSearch();
  }

  function toggleOpen() {
    setOpen((open) => !open);
  }

  return (
    <>
      {/* Desktop — compact trigger that expands into an inline input */}
      <form
        role="search"
        aria-label={t.common.search}
        onSubmit={handleSubmit}
        className="hidden items-center lg:flex"
      >
        <input
          ref={desktopInputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.common.search + " products…"}
          aria-label={t.common.search + " products"}
          className={cn(
            "h-10 w-0 border-0 border-b border-transparent bg-transparent pr-0 text-[15px] text-foreground outline-none transition-[width,opacity,border-color] duration-300 ease-out placeholder:text-muted-foreground",
            open
              ? "w-44 border-border opacity-100 2xl:w-52"
              : "pointer-events-none w-0 opacity-0"
          )}
        />
        <button
          type={open ? "submit" : "button"}
          onClick={open ? undefined : toggleOpen}
          aria-label={open ? t.common.search + " products" : t.common.search}
          className={cn(
            "group relative inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-[15px] font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            open ? "text-foreground" : "text-muted-foreground hover:text-gold-text"
          )}
        >
          <Search className="size-4" aria-hidden="true" />
          <span className={cn("transition-opacity duration-300", open && "hidden")}>
            {t.common.search}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold transition-opacity duration-300",
              open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          />
        </button>
      </form>

      {/* Mobile — compact icon trigger */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 lg:hidden"
        onClick={toggleOpen}
        aria-label={open ? "Close search" : t.common.search + " products"}
        aria-expanded={open}
      >
        <Search className="size-5" aria-hidden="true" />
      </Button>

      {/* Mobile — full-width search row attached to the header band */}
      <div
        className={cn(
          "absolute inset-x-0 top-full border-border bg-background/95 shadow-[0_16px_32px_-20px_rgba(13,23,42,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/85 transition-[opacity,transform] duration-300 ease-out lg:hidden",
          open
            ? "translate-y-0 border-b opacity-100"
            : "pointer-events-none -translate-y-1 border-transparent opacity-0"
        )}
        aria-hidden={!open}
      >
        <form role="search" aria-label={t.common.search} onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.common.search + " products…"}
                aria-label={t.common.search + " products"}
                className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-base text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="icon"
              className="size-11 shrink-0"
              aria-label={t.common.search + " products"}
            >
              <Search className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              onClick={() => setOpen(false)}
              aria-label="Close search"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}