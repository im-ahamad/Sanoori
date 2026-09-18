"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";

export function WhatsAppButton() {
  const href = buildWhatsAppLink(GENERAL_ENQUIRY_MESSAGE);

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
