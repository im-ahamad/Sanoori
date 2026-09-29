"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

interface CustomerFilterValues {
  q: string;
  sort: string;
}

interface CustomerFiltersProps {
  values: CustomerFilterValues;
}

function buildQuery(pathname: string, values: CustomerFilterValues): string {
  const params = new URLSearchParams();
  if (values.q.trim()) params.set("q", values.q.trim());
  if (values.sort !== "newest") params.set("sort", values.sort);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function CustomerFilters({ values: initialValues }: CustomerFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useAdminTranslations();
  const [values, setValues] = useState<CustomerFilterValues>({
    q: initialValues.q,
    sort: initialValues.sort,
  });

  const navigate = (next: CustomerFilterValues) => {
    setValues(next);
    router.push(buildQuery(pathname, next));
  };

  const hasActiveFilters = values.q.trim() !== "" || values.sort !== "newest";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        navigate(values);
      }}
      className="rounded-lg border border-border bg-background p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="customer-search">{t.common.search}</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="customer-search"
              type="search"
              placeholder={t.common.searchPlaceholderCustomers}
              value={values.q}
              onChange={(event) =>
                setValues({ ...values, q: event.target.value })
              }
              className="pl-8"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-sort">{t.common.sortBy}</Label>
          <Select
            value={values.sort}
            onValueChange={(value) =>
              navigate({ ...values, sort: value ?? "newest" })
            }
          >
            <SelectTrigger id="filter-sort" className="w-full">
              <SelectValue placeholder={t.common.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                {t.common.recentFirst}
                <ChevronsUpDown className="size-3.5 ml-2" aria-hidden="true" />
              </SelectItem>
              <SelectItem value="oldest">
                {t.common.oldestFirst}
                <ChevronsUpDown className="size-3.5 ml-2 rotate-180" aria-hidden="true" />
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" variant="outline" className="h-9">
            <Search className="size-4" aria-hidden="true" />
            <span className="sr-only">{t.common.applyFilters}</span>
            {t.common.apply}
          </Button>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-2.5"
              onClick={() => navigate({ q: "", sort: "newest" })}
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">{t.common.clearSearchFilters}</span>
              {t.common.clear}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}