import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductCategory } from "@/types/product";
import { getCategoryIconElement } from "@/lib/category-icons";

export function CategoryCard({ category }: { category: ProductCategory }) {
  return (
    <Link
      href={`/products/${category.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex aspect-[16/9] items-center justify-center bg-muted/50">
        {getCategoryIconElement(category.slug, {
          className:
            "size-12 text-muted-foreground transition-colors group-hover:text-primary",
          strokeWidth: 1.5,
        })}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {category.name}
          </h3>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {category.description}
        </p>
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
      </div>
    </Link>
  );
}