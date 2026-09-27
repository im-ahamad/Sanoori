import { generatePageMetadata } from "@/lib/seo";
import { ContactPageContent } from "./contact-content";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import { getPublicBusinessSettings } from "@/lib/public/settings";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function generateMetadata(): Promise<ReturnType<typeof generatePageMetadata>> {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  return generatePageMetadata({
    title: t.contact.pageTitle,
    description: t.contact.pageDescription,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const businessSettings = await getPublicBusinessSettings();
  return <ContactPageContent businessSettings={businessSettings} />;
}