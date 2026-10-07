"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * How long the loading interface stays visible (ms).
 * Long enough to be clearly noticeable, short enough to stay snappy.
 */
const MIN_VISIBLE_MS = 900;

/**
 * Premium loading interface for Sanoori Trading.
 * Uses the existing brand logo and design system colors (navy + gold).
 * Subtle, elegant animation that feels like part of the website.
 */
function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      {/* Subtle ambient gradient backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-navy/5 via-background to-gold/5"
      />

      {/* Gold accent strip at top — echoes header/footer */}
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />

      <div className="relative flex flex-col items-center gap-6 px-4">
        {/* Logo — uses existing Brand component approach */}
        <a href="/" aria-label="Sanoori Trading — Home" className="group">
          <Image
            src="/images/logo.svg"
            alt="Sanoori Trading"
            width={224}
            height={68}
            unoptimized
            priority
            sizes="224px"
            className="h-14 w-auto sm:h-16 lg:h-20 transition-opacity duration-500 group-hover:opacity-80"
          />
        </a>

        {/* Elegant animated loading indicator */}
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>

        {/* Subtle loading text */}
        <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Loading…
        </p>
      </div>
    </div>
  );
}

/**
 * Route-level fallback (`app/loading.tsx`). Shown by Next.js while a route's
 * content is streaming in, exactly as before.
 */
export default function Loading() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <LoadingScreen />;
}

/**
 * Watches the query string so route changes that keep the same path
 * (search box, filters, `router.push`) also start the loading interface.
 * Suspense-wrapped so it never affects rendering of the page itself.
 */
function SearchChangeWatcher({ onChange }: { onChange: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onChange();
  }, [searchParams, onChange]);

  return null;
}

/**
 * Keeps the same loading interface visible for a minimum duration on:
 * - initial page load and refresh (visible from the very first paint),
 * - internal link clicks (as soon as navigation starts),
 * - any other route change (back/forward, programmatic navigation).
 *
 * It only controls the visual transition — no data, form or navigation is delayed.
 */
export function LoadingGate() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const stateRef = useRef<{ visible: boolean; timer: ReturnType<typeof setTimeout> | null }>({
    visible: true,
    timer: null,
  });
  // Last URL we reacted to, so fragment (#section) and same-URL history entries
  // do not flash the loading interface.
  const lastUrlRef = useRef<string>("");

  const hide = useCallback(() => {
    const state = stateRef.current;
    state.visible = false;
    setVisible(false);
  }, []);

  const show = useCallback(() => {
    lastUrlRef.current = window.location.pathname + window.location.search;
    const state = stateRef.current;
    if (state.visible) return;
    state.visible = true;
    setVisible(true);
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(hide, MIN_VISIBLE_MS);
  }, [hide]);

  // Initial page load / refresh — visible from the first paint, then released.
  useEffect(() => {
    const state = stateRef.current;
    state.visible = true;
    lastUrlRef.current = window.location.pathname + window.location.search;
    state.timer = setTimeout(hide, MIN_VISIBLE_MS);
    return () => {
      if (state.timer) clearTimeout(state.timer);
    };
  }, [hide]);

  // Route changes we did not start from a link click (back/forward, router.push).
  useEffect(() => {
    show();
  }, [pathname, show]);

  // Internal link clicks — start showing the moment navigation begins.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      const anchorTarget = anchor.getAttribute("target");
      if (anchorTarget && anchorTarget !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // Same-origin route changes only: skips mailto/tel/WhatsApp, external and social links.
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      show();
    };

    const onPopState = () => {
      const url = window.location.pathname + window.location.search;
      if (url === lastUrlRef.current) return;
      show();
    };

    document.addEventListener("click", onClick, true);
    // Browser back/forward, including history entries that only differ by query string.
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [show]);

  return (
    <>
      {visible ? <LoadingScreen /> : null}
      <Suspense fallback={null}>
        <SearchChangeWatcher onChange={show} />
      </Suspense>
    </>
  );
}
