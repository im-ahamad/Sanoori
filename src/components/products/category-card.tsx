import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PublicCategory } from "@/lib/public/catalogue";
import { getCategoryIconElement } from "@/lib/category-icons";

export function CategoryCard({ category }: { category: PublicCategory }) {
  const href = `/products?category=${category.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
      <Link
        href={href}
        tabIndex={-1}
        className="relative block aspect-[16/9] overflow-hidden bg-muted/50 focus-visible:outline-none"
        aria-label={`Browse the ${category.name} category`}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/60 to-muted">
            {getCategoryIconElement(category.slug, {
              className:
                "size-14 text-muted-foreground transition-colors group-hover:text-primary",
              strokeWidth: 1.4,
            })}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          <Link
            href={href}
            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {category.name}
          </Link>
        </h3>
        {category.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        )}
        {category.subcategories.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {category.subcategories.slice(0, 3).map((sub) => (
              <li
                key={sub.id}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {sub.name}
              </li>
            ))}
            {category.subcategories.length > 3 && (
              <li className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                +{category.subcategories.length - 3} more
              </li>
            )}
          </ul>
        )}
        <div className="mt-5 flex flex-1 items-end">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Explore Products
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}