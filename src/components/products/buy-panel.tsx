"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MessageCircle, Minus, Phone, Plus } from "lucide-react";
import { createWhatsAppProductLink } from "@/lib/contact/whatsapp";
import type { PublicBusinessSettings } from "@/lib/public/settings";
import { useTranslations } from "@/lib/i18n/use-translations";

export interface BuyContactChannel {
  id: "phone";
  label: string;
  href: string;
}

interface BuyPanelProps {
  productName: string;
  productId: string;
  productCode: string | null;
  productUrl: string;
  /** Product slug used for the complementary price-request link. */
  productSlug: string;
  /** Business phone (Call Us) when the number is configured. */
  phoneChannel?: BuyContactChannel | null;
  /** Business settings for WhatsApp link generation. */
  businessSettings: PublicBusinessSettings;
}

const QUANTITY_MIN = 1;
const QUANTITY_MAX = 9999;

/**
 * The main buying actions. Two independent options:
 * - Ask for Price: opens the website Request Quote flow.
 * - WhatsApp: directly opens WhatsApp with the product request prepared.
 */
export function BuyPanel({
  productName,
  productId,
  productCode,
  productUrl,
  productSlug,
  phoneChannel,
  businessSettings,
}: BuyPanelProps) {
  const t = useTranslations();
  const pd = t.productDetails;
  const [quantity, setQuantity] = useState(QUANTITY_MIN);

  /**
   * The action bar below is `fixed`, so it needs reserved page space —
   * otherwise the last content on the page (footer links) stays permanently
   * trapped behind it. Mirror the bar's own height as page bottom padding
   * while it is visible. The bar is `md:hidden`, so from 768px up it measures
   * 0px, the padding is cleared, and the approved desktop layout is untouched.
   */
  const stickyBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = stickyBarRef.current;
    if (!bar) return;

    const previous = document.body.style.paddingBottom;
    const sync = () => {
      const height = bar.offsetHeight;
      document.body.style.paddingBottom = height > 0 ? `${height}px` : previous;
    };

    sync();
    // Watch both the bar (label/language changes change its height) and the
    // breakpoint-crossing window resize that shows or hides it.
    const observer = new ResizeObserver(sync);
    observer.observe(bar);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      document.body.style.paddingBottom = previous;
    };
  }, []);

  const whatsapp = createWhatsAppProductLink(businessSettings, {
    productName,
    productId,
    productCode,
    quantity,
    productUrl,
  });

  const requestHref = `/request-quote?product=${productSlug}&quantity=${quantity}`;

  function clamp(value: number): number {
    if (Number.isNaN(value)) return QUANTITY_MIN;
    return Math.min(QUANTITY_MAX, Math.max(QUANTITY_MIN, Math.round(value)));
  }

  function onInputChange(raw: string) {
    const parsed = Number(raw);
    if (raw === "") return;
    setQuantity(clamp(parsed));
  }

  const askForPriceButton = (extraClassName: string) => (
    <Link
      href={requestHref}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-0 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap ${extraClassName}`}
    >
      <span>{pd.askForPrice}</span>
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );

  const whatsAppButton = (extraClassName: string) =>
    whatsapp ? (
      <a
        href={whatsapp.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get the price of ${productName} on WhatsApp`}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-0 text-sm font-semibold text-white transition-colors hover:bg-[#1fb958] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 whitespace-nowrap ${extraClassName}`}
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        <span>{pd.getPriceOnWhatsApp}</span>
      </a>
    ) : null;

  return (
    <>
      <div className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm text-center">
        <div>
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
            {pd.getPriceTitle}
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {pd.getPriceDescription}
          </p>
        </div>

        {/* Quantity */}
        <div>
          <label
            htmlFor="buy-quantity"
            className="font-heading text-sm font-semibold text-foreground"
          >
            {pd.quantityLabel}
          </label>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((value) => clamp(value - 1))}
              disabled={quantity <= QUANTITY_MIN}
              aria-label="Decrease quantity"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <input
              id="buy-quantity"
              type="number"
              inputMode="numeric"
              min={QUANTITY_MIN}
              max={QUANTITY_MAX}
              value={quantity}
              onChange={(event) => onInputChange(event.target.value)}
              onBlur={(event) => setQuantity(clamp(Number(event.target.value)))}
              className="h-10 w-20 rounded-md border border-input bg-background text-center text-sm font-semibold tabular-nums outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
            <button
              type="button"
              onClick={() => setQuantity((value) => clamp(value + 1))}
              disabled={quantity >= QUANTITY_MAX}
              aria-label="Increase quantity"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {pd.quantityHint}
          </p>
        </div>

        {/* Primary actions: Ask for Price + WhatsApp + Call — equal size, centered */}
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          {askForPriceButton("w-[150px]")}
          {whatsAppButton("w-[180px]")}
          {phoneChannel && (
            <a
              href={phoneChannel.href}
              className="inline-flex h-11 w-[150px] items-center justify-center gap-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-semibold transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              <Phone className="size-4" aria-hidden="true" />
              {pd.callUs}
            </a>
          )}
        </div>

        {whatsapp && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {pd.whatsappOpensWithDetails}
          </p>
        )}

        {/* Large project / multiple products */}
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="text-sm font-semibold text-foreground">
            {pd.projectOrderTitle}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {pd.projectOrderDescription}
          </p>
          <Link
            href={requestHref}
            className="mt-1.5 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            {pd.sendProjectList}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div
        ref={stickyBarRef}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur md:hidden"
      >
        <div className="flex justify-center gap-2 flex-wrap">
          {askForPriceButton("w-[150px]")}
          {whatsAppButton("w-[180px]")}
          {phoneChannel && (
            <a
              href={phoneChannel.href}
              className="inline-flex h-11 w-[150px] items-center justify-center gap-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-semibold transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              <Phone className="size-4" aria-hidden="true" />
              {pd.callUs}
            </a>
          )}
        </div>
      </div>
    </>
  );
}