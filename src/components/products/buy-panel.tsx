"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Minus, Plus, MessageCircle, MessagesSquare, Camera, Send, Phone, ArrowRight } from "lucide-react";
import { createWhatsAppProductLink } from "@/lib/contact/whatsapp";

export interface BuyContactChannel {
  id: "facebook" | "instagram" | "telegram" | "phone";
  label: string;
  href: string;
}

interface BuyPanelProps {
  productName: string;
  productId: string;
  productCode: string | null;
  productUrl: string;
  /** Product slug used for the complementary /request-quote link. */
  productSlug: string;
  /** Configured contact channels OTHER than WhatsApp (shown as alternatives). */
  channels: BuyContactChannel[];
}

const CHANNEL_ICONS: Record<BuyContactChannel["id"], typeof Phone> = {
  facebook: MessagesSquare,
  instagram: Camera,
  telegram: Send,
  phone: Phone,
};

const QUANTITY_MIN = 1;
const QUANTITY_MAX = 9999;

/**
 * The main customer action: BUY → WhatsApp (or an alternative contact channel).
 * The quantity stepper feeds the pre-filled WhatsApp message. No cart, no
 * checkout, no payment — the quantity is simply part of the inquiry.
 */
export function BuyPanel({
  productName,
  productId,
  productCode,
  productUrl,
  productSlug,
  channels,
}: BuyPanelProps) {
  const [quantity, setQuantity] = useState(QUANTITY_MIN);

  const whatsapp = createWhatsAppProductLink({
    productName,
    productId,
    productCode,
    quantity,
    productUrl,
  });

  function clamp(value: number): number {
    if (Number.isNaN(value)) return QUANTITY_MIN;
    return Math.min(QUANTITY_MAX, Math.max(QUANTITY_MIN, Math.round(value)));
  }

  function onInputChange(raw: string) {
    const parsed = Number(raw);
    if (raw === "") return;
    setQuantity(clamp(parsed));
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
          How to buy
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Choose a quantity and message us — we confirm availability, pricing and
          delivery.
        </p>
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="buy-quantity"
          className="font-heading text-sm font-semibold text-foreground"
        >
          Quantity
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((value) => clamp(value - 1))}
            disabled={quantity <= QUANTITY_MIN}
            aria-label="Decrease quantity"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="relative inline-flex items-center">
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
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => clamp(value + 1))}
            disabled={quantity >= QUANTITY_MAX}
            aria-label="Increase quantity"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
          <span className="sr-only">
            Selected quantity: {quantity}
          </span>
        </div>
      </div>

      {/* Primary BUY action */}
      {whatsapp ? (
        <a
          href={whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1fb958] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Buy on WhatsApp
        </a>
      ) : null}
      {whatsapp ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Opens WhatsApp with a pre-filled message including this product,
          quantity and a link to this page.
        </p>
      ) : null}

      {/* Alternative channels */}
      {channels.length > 0 ? (
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">
            Or contact us via
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {channels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.id] ?? Send;
              return (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {channel.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Nothing configured yet — polite fallback */}
      {!whatsapp && channels.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
          Direct contact details are being prepared. Send us a request and we
          will get back to you.
          <Link
            href={`/request-quote?product=${productSlug}`}
            className="mt-2 block font-semibold text-primary underline-offset-2 hover:underline"
          >
            Request a Quote
          </Link>
        </div>
      ) : null}

      {/* Complementary written request — the formal path alongside instant chat */}
      <div className="rounded-md border border-border p-4">
        <p className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
          <FileText className="size-4 text-primary" aria-hidden="true" />
          Prefer a written request?
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Send a formal quote request mentioning this product and we will
          respond with pricing by phone or email.
        </p>
        <Link
          href={`/request-quote?product=${productSlug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Request a Quote
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}