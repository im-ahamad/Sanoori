"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

const ADMIN_PREFIX = "/admin";

/**
 * Renders the public site chrome (header/footer/whatsapp) everywhere except
 * inside the private /admin area, which uses its own dashboard shell.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);

  return (
    <>
      {isAdmin ? null : <Header />}
      <div id="main-content" className="flex flex-1 flex-col">
        {children}
      </div>
      {isAdmin ? null : (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}
    </>
  );
}