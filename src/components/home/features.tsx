import {
  ClipboardList,
  Eye,
  LayoutGrid,
  MessageCircle,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";

const features = [
  {
    title: "Product-focused support",
    description:
      "Guidance on choosing the right sanitary ware, tiles, and building materials for your requirements.",
    icon: ClipboardList,
  },
  {
    title: "Clear product information",
    description:
      "Detailed listings with specifications, variants, and current availability for every item.",
    icon: Eye,
  },
  {
    title: "Easy browsing across categories",
    description:
      "An organised catalogue you can search and filter by category to find what you need quickly.",
    icon: LayoutGrid,
  },
  {
    title: "Direct inquiry via WhatsApp",
    description:
      "Message us directly with product details and quantity — no online checkout or payment required.",
    icon: MessageCircle,
  },
];

export function Features() {
  return (
    <section className="section-spacing bg-background">
      <div className="container-sanoori">
        <Reveal>
          <SectionHeader
            align="center"
            title="Why Sanoori Trading"
            description="A straightforward way to find building products, get the details you need, and ask for pricing."
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08}>
              <div className="h-full rounded-lg border border-border bg-card p-6">
                <div className="flex size-12 items-center justify-center rounded-md bg-accent text-primary">
                  <feature.icon className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}