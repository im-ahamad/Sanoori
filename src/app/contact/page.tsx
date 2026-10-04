import { generatePageMetadata } from "@/lib/seo";
import { ContactPageContent } from "./contact-content";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import { getPublicBusinessSettings } from "@/lib/public/settings";
import { getPublicCategories, type PublicCategory } from "@/lib/public/catalogue";

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
  const [businessSettings, categories] = await Promise.all([
    getPublicBusinessSettings(),
    // Catalogue is optional context for the page: a database hiccup must not
    // take the contact details and inquiry form down with it.
    getPublicCategories().catch((): PublicCategory[] => []),
  ]);

  return (
    <div className="relative">
      <ContactPageContent
        businessSettings={businessSettings}
        categories={categories.map(({ slug, name }) => ({ slug, name }))}
      />
    </div>
  );
}