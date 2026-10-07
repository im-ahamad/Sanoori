"use client";

import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import type { PublicBusinessSettings } from "@/lib/public/settings";

interface WhatsAppButtonProps {
  settings: PublicBusinessSettings;
}

/** Shared circle styling: 56px desktop (40px ≤768px), soft shadow, `scale(1.08)` hover. */
const FLOAT_BUTTON =
  "flex size-14 [@media(max-width:768px)]:size-10 items-center justify-center rounded-full " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.20)] " +
  "transition-transform duration-200 ease-[ease] hover:[transform:scale(1.08)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2";

/** Mobile (≤768px): the stack shows only WhatsApp + Facebook — `display: none`. */
const HIDE_ON_MOBILE = "[@media(max-width:768px)]:hidden";

/** Mobile (≤768px): icons scale from 26px down to 20px. */
const ICON_SIZE = "size-[26px] [@media(max-width:768px)]:size-[20px]";

/**
 * Floating social contact bar (`.social-float`).
 *
 * Desktop (≥769px) — unchanged: one fixed stack anchored bottom-right
 * (right: 20px / bottom: 20px, z-index: 999, 12px gap, 56px circles,
 * 26px icons), rendered top → bottom:
 *
 *   WhatsApp → Facebook → TikTok → YouTube → Email
 *
 * Mobile (≤768px, `@media (max-width: 768px)`) — only:
 *
 *   WhatsApp (top) → Facebook (below)
 *
 * at 40px with 20px icons, a 10px gap, floated on the LEFT edge around
 * the vertical centre (`left: 14px / right: auto / top: 50%` with
 * `transform: translateY(-50%)`); TikTok, YouTube and Email are
 * `display: none`.
 *
 * Colours, shadows, radius, hover, focus ring and the WhatsApp → Facebook
 * order are identical at both breakpoints. The WhatsApp entry reuses the
 * same configured wa.me link, so its behaviour and destination are
 * unchanged. Icons are inline SVG only — no icon library added.
 */
export function WhatsAppButton({ settings }: WhatsAppButtonProps) {
  const whatsappHref = buildWhatsAppLink(settings, GENERAL_ENQUIRY_MESSAGE);

  // Resolved social links from settings (with config fallback already applied in PublicBusinessSettings)
  const tiktokHref = settings.tiktok;
  const youtubeHref = settings.youtube;
  const emailAddress = settings.email;

  return (
    <div className="social-float fixed bottom-5 right-5 z-[999] flex flex-col gap-3 [@media(max-width:768px)]:left-3.5 [@media(max-width:768px)]:right-auto [@media(max-width:768px)]:top-1/2 [@media(max-width:768px)]:bottom-auto [@media(max-width:768px)]:[transform:translateY(-50%)] [@media(max-width:768px)]:gap-2.5">
      {/* 1 — WhatsApp (existing configured link, unchanged) */}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${FLOAT_BUTTON} bg-[#25D366]`}
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 24 24" className={`${ICON_SIZE} fill-white`} aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}

      {/* 2 — Facebook (icon always present, no link since no confirmed URL) */}
      <div className={`${FLOAT_BUTTON} bg-[#1877F2] cursor-default`} aria-label="Facebook">
        <svg viewBox="0 0 24 24" className={`${ICON_SIZE} fill-white`} aria-hidden="true">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      </div>

      {/* 3 — TikTok */}
      {tiktokHref && (
        <a
          href={tiktokHref}
          target="_blank"
          rel="noopener"
          className={`${FLOAT_BUTTON} bg-[#000000] ${HIDE_ON_MOBILE}`}
          aria-label="TikTok"
        >
          <svg viewBox="0 0 24 24" className={`${ICON_SIZE} fill-white`} aria-hidden="true">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        </a>
      )}

      {/* 4 — YouTube */}
      {youtubeHref && (
        <a
          href={youtubeHref}
          target="_blank"
          rel="noopener"
          className={`${FLOAT_BUTTON} bg-[#FF0000] ${HIDE_ON_MOBILE}`}
          aria-label="YouTube"
        >
          <svg viewBox="0 0 24 24" className={`${ICON_SIZE} fill-white`} aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
      )}

      {/* 5 — Email */}
      {emailAddress && (
        <a href={`mailto:${emailAddress}`} className={`${FLOAT_BUTTON} bg-[#EA4335] ${HIDE_ON_MOBILE}`} aria-label="Email">
          <svg
            viewBox="0 0 24 24"
            className={`${ICON_SIZE}`}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 6-10 7L2 6" />
          </svg>
        </a>
      )}
    </div>
  );
}