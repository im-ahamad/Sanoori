import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServerTranslations } from "@/lib/i18n/server-translations";

export interface PaginationState {
  page: number;
  totalPages: number;
  total: number;
  /** Active filter/query values to preserve across pages. */
  queryParams: Record<string, string>;
}

function buildHref(queryParams: Record<string, string>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  return `/products?${params.toString()}`;
}

/**
 * Server-rendered pagination. Always carries the active search/filter query so
 * navigating pages never loses the user's context.
 */
export function Pagination({ state, t }: { state: PaginationState; t: ReturnType<typeof getServerTranslations> }) {
  const { page, totalPages, total, queryParams } = state;

  if (totalPages <= 1) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t.products.showingProducts.replace("{total}", total.toString()).replace("{product|products}", total === 1 ? t.products.product : t.products.products)}
      </p>
    );
  }

  const pages = buildPageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        <PageButton
          href={buildHref(queryParams, page - 1)}
          disabled={page <= 1}
          label={t.products.previousPage}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t.products.previous}</span>
        </PageButton>

        {pages.map((item, index) =>
          item.kind === "number" ? (
            <Link
              key={item.value}
              href={buildHref(queryParams, Number(item.value))}
              aria-current={item.value === page ? "page" : undefined}
              aria-label={`${t.products.pageOf.split("·")[0].trim().replace("{page}", String(item.value)).replace("{totalPages}", String(totalPages))} ${item.value}`}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                item.value === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
              )}
            >
              {item.value}
            </Link>
          ) : (
            <span
              key={`gap-${index}`}
              className="inline-flex h-9 items-center px-1.5 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          )
        )}

        <PageButton
          href={buildHref(queryParams, page + 1)}
          disabled={page >= totalPages}
          label={t.products.nextPage}
        >
          <span className="hidden sm:inline">{t.products.next}</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </PageButton>
      </div>

      <p className="text-sm text-muted-foreground">
        {t.products.pageOf
          .replace("{page}", page.toString())
          .replace("{totalPages}", totalPages.toString())
          .replace("{total}", total.toString())
          .replace("{product|products}", total === 1 ? t.products.product : t.products.products)}
      </p>
    </nav>
  );
}

function PageButton({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm text-muted-foreground/50"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}

/** Window of page numbers with ellipsis gaps (e.g. 1 … 4 5 6 … 12). */
function buildPageWindow(
  current: number,
  total: number
): Array<{ kind: "number"; value: string | number } | { kind: "gap" }> {
  const result: Array<{ kind: "number"; value: string | number } | { kind: "gap" }> = [];
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  let prev = 0;
  for (const page of sorted) {
    if (page - prev > 1) result.push({ kind: "gap" });
    result.push({ kind: "number", value: page });
    prev = page;
  }
  return result;
}