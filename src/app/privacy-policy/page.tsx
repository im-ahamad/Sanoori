import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Privacy Policy",
  description:
    "How Sanoori Trading collects, uses, and protects the information you share with us when you visit our website or contact us.",
  path: "/privacy-policy",
});

const policies = [
  {
    title: "Introduction",
    body: [
      `This Privacy Policy explains how ${siteConfig.name} ("we", "us", or "our") handles the information you share with us when you visit our website. We aim to keep things simple: we collect only the information we need to respond to you, and we do not sell your personal information.`,
      "By using this website, you agree to the practices described in this policy. If you do not agree with any part of it, please stop using the website.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "We collect information that you choose to give us. This happens in two main ways:",
    ],
    list: [
      "Information you send us through our enquiry forms, such as your name, phone number, email address, company name (optional), the products you are interested in, quantities, and any message you write.",
      "Information you share with us on WhatsApp or by phone or email when you contact us directly.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use the information you provide for a limited set of purposes:",
    ],
    list: [
      "To answer your questions and respond to your enquiries.",
      "To prepare price quotes and delivery information for the products you ask about.",
      "To follow up on orders or requests you have sent us.",
      "To improve our website and the way we respond to customers.",
    ],
  },
  {
    title: "Contact and Inquiry Information",
    body: [
      "When you contact us — through a form, WhatsApp, phone, or email — we keep the details of that conversation so we can refer back to it and serve you better. For example, we keep the products you enquired about, the prices we quoted, and the message history.",
      "We only keep this information as long as it is useful for the purpose it was shared, and we do not use it for anything unrelated to your enquiry.",
    ],
  },
  {
    title: "Cookies and Website Usage",
    body: [
      "We do not place marketing or advertising cookies on this website. The site stores a small amount of information in your browser (local storage) to remember your preferences, such as your preferred theme (light or dark) and language. This stays on your device and is not shared with anyone.",
      "Like most websites, our server logs record basic technical details while you browse, such as the pages you visit and the time of your visit. This helps us keep the website working and understand how it is used, without identifying you personally.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "We use a few services to run this website, and each is responsible for its own handling of data under its own terms and privacy policy:",
    ],
    list: [
      "Cloudinary: we use this service to store and deliver the product images shown on the website.",
      "WhatsApp: if you message us on WhatsApp, your message and the number you send it from are handled by WhatsApp under its own privacy policy.",
      "Fonts and other basic building blocks are loaded by the website itself, not by third-party trackers. We do not use advertising or analytics trackers on this site.",
    ],
  },
  {
    title: "Data Security",
    body: [
      "We take reasonable steps to protect the information you share with us against loss, misuse, and unauthorised access. Access to your information is limited to the people at ${siteConfig.name} who need it to serve you.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We keep your information only for as long as needed to deal with your enquiry, prepare a quote, or complete an order — or for as long as we are required to keep it by law. When it is no longer needed, we delete it or remove the details that identify you.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "You can ask us, at any time, to see what information we hold about you, to correct it, or to delete it. You can also ask us to stop processing your information. To make any of these requests, use the contact details below. We will respond within a reasonable time.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    body: [
      "We may update this policy from time to time, for example as our website or the way we work changes. The latest version will always be available on this page, with the date it was last updated shown below. Please check back if this matters to you.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Privacy Policy"
        description="Simple, honest information about how we handle the data you share with us."
        breadcrumbs={[{ label: "Privacy Policy", href: "/privacy-policy" }]}
      />

      <div className="section-spacing">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <p className="text-sm text-muted-foreground">
                Last updated: September 2024
              </p>

              <div className="mt-6 space-y-12">
                {policies.map((section) => (
                  <section key={section.title}>
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                      {section.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                      {section.list && (
                        <ul className="ml-4 list-disc space-y-2">
                          {section.list.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                ))}

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Contact Us
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    If you have any questions about this Privacy Policy or
                    about the information we hold about you, please get in
                    touch. We will be happy to help.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink href="/contact">Contact Us</ButtonLink>
                    <ButtonLink href="/products" variant="outline">
                      See Products
                    </ButtonLink>
                  </div>
                </section>
              </div>
            </div>
          </Reveal>
        </Container>
      </div>
    </main>
  );
}