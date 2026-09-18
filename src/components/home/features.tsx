import { ShieldCheck, Truck, BadgeCheck, MessageSquare } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";

const features = [
  {
    title: "Quality products",
    description:
      "We select sanitary ware, tiles, and materials for durability and consistent quality across orders.",
    icon: ShieldCheck,
  },
  {
    title: "Reliable supply",
    description:
      "Steady availability of the items you need, so your project stays on schedule.",
    icon: Truck,
  },
  {
    title: "Practical pricing",
    description:
      "Fair wholesale-friendly pricing for builders, retailers, and direct buyers.",
    icon: BadgeCheck,
  },
  {
    title: "Responsive service",
    description:
      "Quick answers to enquiries, with product guidance and quotations when you need them.",
    icon: MessageSquare,
  },
];

export function Features() {
  return (
    <section className="section-spacing bg-muted/40">
      <div className="container-sanoori">
        <Reveal>
          <SectionHeader
            align="center"
            title="Why builders and buyers work with us"
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.1}>
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