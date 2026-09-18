import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { navigationConfig } from "@/config/site";
import { Reveal } from "@/components/shared/reveal";

const gridOverlayStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-navy-dark text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={gridOverlayStyle}
      />
      <Container>
        <div className="relative section-spacing flex flex-col items-center text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Need pricing or availability for your next project?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Send us your requirements and we will respond with a quote and
              current availability.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <ButtonLink
                href={navigationConfig.cta.href}
                variant="inverse"
                size="lg"
              >
                Request a Quote
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline-inverse" size="lg">
                Contact Us
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}