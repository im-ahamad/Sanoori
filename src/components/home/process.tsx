import { Send, FileText, ClipboardCheck, PackageCheck } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";

const steps = [
  {
    title: "Send your enquiry",
    description:
      "Share your requirements — product type, category, or quantity — through our quote request or directly by phone or WhatsApp.",
    icon: Send,
  },
  {
    title: "Receive a quote",
    description:
      "We respond with pricing, availability, and delivery options for the items you need.",
    icon: FileText,
  },
  {
    title: "Confirm your order",
    description:
      "Finalise quantities and details, and we prepare your order for supply.",
    icon: ClipboardCheck,
  },
  {
    title: "Delivery & support",
    description:
      "Products are delivered as agreed, with support to follow up if anything is needed.",
    icon: PackageCheck,
  },
];

export function Process() {
  return (
    <section className="section-spacing bg-background">
      <div className="container-sanoori">
        <Reveal>
          <SectionHeader
            align="center"
            title="How it works"
            description="A straightforward process from enquiry to delivery."
          />
        </Reveal>

        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1}>
              <li className="relative h-full rounded-lg border border-border bg-card p-6">
                <span className="font-heading text-sm font-bold text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="mt-3 flex items-center gap-3">
                  <step.icon className="size-5 text-primary" strokeWidth={1.75} />
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}