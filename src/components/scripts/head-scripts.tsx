"use client";

import Script from "next/script";
import { themeScript } from "@/components/theme/theme-script";

export function HeadScripts() {
  return (
    <>
      <Script
        id="theme-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: themeScript }}
      />
      <Script
        id="lang-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `try{const c=document.cookie.match(/sanoori-lang=([^;]+)/);const l=c?c[1]:"en";if(l==="en"||l==="bn")document.documentElement.lang=l;}catch(_){document.documentElement.lang="en";}`,
        }}
      />
    </>
  );
}