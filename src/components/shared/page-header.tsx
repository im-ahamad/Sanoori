import Link from "next/link";
import { Container } from "@/components/layout/container";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  return (
    <section className="border-b border-border bg-muted/30">
      <Container>
        <div className="py-12 sm:py-16 lg:py-20">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <li>
                  <Link href="/" className="transition-colors hover:text-foreground">
                    Home
                  </Link>
                </li>
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    <span aria-hidden="true">/</span>
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-foreground">{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
