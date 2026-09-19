import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";

export function DiscoveryCta() {
  return (
    <section className="section-spacing bg-navy text-white">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Looking for something specific?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
                Browse the full catalogue of sanitary ware, tiles, and building
                materials — or contact us and we can help you find what your
                project needs.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" variant="inverse" size="lg">
                View All Products
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href="/request-quote"
                variant="outline-inverse"
                size="lg"
              >
                Request a Quote
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}