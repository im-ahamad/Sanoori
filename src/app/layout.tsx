import { Inter, DM_Sans } from "next/font/google";
import { generateSiteMetadata } from "@/lib/seo";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import { HeadScripts } from "@/components/scripts/head-scripts";
import { getPublicBusinessSettings } from "@/lib/public/settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = generateSiteMetadata();

async function getLanguageFromCookie(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [lang, businessSettings] = await Promise.all([
    getLanguageFromCookie(),
    getPublicBusinessSettings(),
  ]);
  const t = getServerTranslations(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <HeadScripts />
      </head>
      <body className="min-h-full flex flex-col relative">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          {t.layout.skipToMainContent}
        </a>
        
        <Providers initialLanguage={lang}>
          <SiteChrome footer={<Footer />} settings={businessSettings}>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}