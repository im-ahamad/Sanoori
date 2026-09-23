import { Inter, DM_Sans } from "next/font/google";
import { generateSiteMetadata } from "@/lib/seo";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { themeScript } from "@/components/theme/theme-script";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const l=localStorage.getItem("sanoori-lang");if(l==="en"||l==="bn")document.documentElement.lang=l;}catch(_){}`,
          }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <Providers>
          <SiteChrome footer={<Footer />}>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}