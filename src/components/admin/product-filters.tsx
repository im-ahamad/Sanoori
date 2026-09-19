"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
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
import {
  availabilityLabels,
  availabilityValues,
} from "@/lib/validators/product";

interface ProductFilterValues {
  q: string;
  category: string;
  availability: string;
  featured: string;
}

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string }>;
  values: ProductFilterValues;
}

const featuredOptions = [
  { value: "true", label: "Featured only" },
  { value: "false", label: "Not featured" },
];

function buildQuery(pathname: string, values: ProductFilterValues): string {
  const params = new URLSearchParams();
  if (values.q.trim()) params.set("q", values.q.trim());
  if (values.category) params.set("category", values.category);
  if (values.availability) params.set("availability", values.availability);
  if (values.featured !== "") params.set("featured", values.featured);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ProductFilters({
  categories,
  values: initialValues,
}: ProductFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [values, setValues] = useState<ProductFilterValues>({
    q: initialValues.q,
    category: initialValues.category,
    availability: initialValues.availability,
    featured: initialValues.featured ?? "",
  });

  const navigate = (next: ProductFilterValues) => {
    setValues(next);
    router.push(buildQuery(pathname, next));
  };

  const hasActiveFilters =
    values.q.trim() !== "" ||
    values.category !== "" ||
    values.availability !== "" ||
    values.featured !== "";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        navigate(values);
      }}
      className="rounded-lg border border-border bg-background p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)_minmax(160px,220px)_minmax(160px,200px)_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="product-search">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="product-search"
              type="search"
              placeholder="Name, slug or product ID"
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
          <Label htmlFor="filter-category">Category</Label>
          <Select
            value={values.category || null}
            onValueChange={(value) =>
              navigate({ ...values, category: value ?? "" })
            }
          >
            <SelectTrigger id="filter-category" className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-availability">Availability</Label>
          <Select
            value={values.availability || null}
            onValueChange={(value) =>
              navigate({ ...values, availability: value ?? "" })
            }
          >
            <SelectTrigger id="filter-availability" className="w-full">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Any status</SelectItem>
              {availabilityValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {availabilityLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-featured">Featured</Label>
          <Select
            value={values.featured || null}
            onValueChange={(value) =>
              navigate({ ...values, featured: value ?? "" })
            }
          >
            <SelectTrigger id="filter-featured" className="w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Any</SelectItem>
              {featuredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" variant="outline" className="h-9">
            <Search className="size-4" aria-hidden="true" />
            <span className="sr-only">Apply search and filters</span>
            Apply
          </Button>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-2.5"
              onClick={() =>
                navigate({ q: "", category: "", availability: "", featured: "" })
              }
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Clear search and filters</span>
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}