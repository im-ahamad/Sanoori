"use client";

import Link from "next/link";
import { useState } from "react";
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
      className={`inline-flex h-13 items-center justify-center gap-2 rounded-md bg-primary px-4 py-0 text-sm sm:text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap ${extraClassName}`}
    >
      <span>{pd.askForPrice}</span>
      <ArrowRight className="size-5" aria-hidden="true" />
    </Link>
  );

  const whatsAppButton = (extraClassName: string) =>
    whatsapp ? (
      <a
        href={whatsapp.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get the price of ${productName} on WhatsApp`}
        className={`inline-flex h-13 items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-0 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-[#1fb958] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 whitespace-nowrap ${extraClassName}`}
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        <span>{pd.getPriceOnWhatsApp}</span>
      </a>
    ) : null;

  return (
    <>
      <div className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {pd.getPriceTitle}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((value) => clamp(value - 1))}
              disabled={quantity <= QUANTITY_MIN}
              aria-label="Decrease quantity"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="h-11 w-20 rounded-md border border-input bg-background text-center text-base font-semibold tabular-nums outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
            <button
              type="button"
              onClick={() => setQuantity((value) => clamp(value + 1))}
              disabled={quantity >= QUANTITY_MAX}
              aria-label="Increase quantity"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {pd.quantityHint}
          </p>
        </div>

        {/* Primary actions: Ask for Price + WhatsApp — side-by-side on all screens */}
        <div className="flex gap-2">
          {askForPriceButton("flex-1 min-w-0")}
          {whatsAppButton("flex-1 min-w-0")}
        </div>

        {whatsapp && (
          <p className="text-xs leading-relaxed text-muted-foreground text-center sm:text-left">
            {pd.whatsappOpensWithDetails}
          </p>
        )}

        {/* Call instead */}
        {phoneChannel && (
          <a
            href={phoneChannel.href}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-6 text-base font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="size-5" aria-hidden="true" />
            {pd.callUs}
          </a>
        )}

        {/* Large project / multiple products */}
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">
            {pd.projectOrderTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {pd.projectOrderDescription}
          </p>
          <Link
            href={requestHref}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            {pd.sendProjectList}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur md:hidden">
        <div className="flex gap-2">
          {askForPriceButton("flex-1 min-w-0")}
          {whatsAppButton("flex-1 min-w-0")}
          {phoneChannel && (
            <a
              href={phoneChannel.href}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-base font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Phone className="size-5" aria-hidden="true" />
              {pd.callUs}
            </a>
          )}
        </div>
      </div>
    </>
  );
}