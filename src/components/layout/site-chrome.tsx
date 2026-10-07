"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import type { PublicBusinessSettings } from "@/lib/public/settings";

const ADMIN_PREFIX = "/admin";

/**
 * Renders the public site chrome (header/footer/whatsapp) everywhere except
 * inside the private /admin area, which uses its own dashboard shell.
 *
 * `footer` arrives as a slot from the server root layout so it can be a
 * data-fetching Server Component while the admin/non-admin switch below still
 * lives in the client.
 */
interface SiteChromeProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  settings: PublicBusinessSettings;
}

export function SiteChrome({ children, footer, settings }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);

  return (
    <div className="flex flex-col min-h-full">
      {isAdmin ? null : <Header />}
      <div id="main-content" className="flex flex-1 flex-col relative z-10">
        {children}
      </div>
      {isAdmin ? null : (
        <>
          {footer}
          <WhatsAppButton settings={settings} />
        </>
      )}
    </div>
  );
}