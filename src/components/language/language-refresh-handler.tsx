"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LanguageRefreshHandler() {
  const router = useRouter();

  useEffect(() => {
    function onLanguageChange() {
      router.refresh();
    }
    window.addEventListener("sanoori-language-change", onLanguageChange);
    return () => window.removeEventListener("sanoori-language-change", onLanguageChange);
  }, [router]);

  return null;
}