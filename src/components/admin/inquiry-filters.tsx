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
  inquirySourceLabel,
  inquirySourceValues,
  inquiryStatusLabel,
  inquiryStatusValues,
} from "@/lib/inquiries";

interface InquiryFilterValues {
  q: string;
  status: string;
  source: string;
}

interface InquiryFiltersProps {
  values: InquiryFilterValues;
}

function buildQuery(pathname: string, values: InquiryFilterValues): string {
  const params = new URLSearchParams();
  if (values.q.trim()) params.set("q", values.q.trim());
  if (values.status) params.set("status", values.status);
  if (values.source) params.set("source", values.source);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function InquiryFilters({ values: initialValues }: InquiryFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [values, setValues] = useState<InquiryFilterValues>({
    q: initialValues.q,
    status: initialValues.status,
    source: initialValues.source,
  });

  const navigate = (next: InquiryFilterValues) => {
    setValues(next);
    router.push(buildQuery(pathname, next));
  };

  const hasActiveFilters =
    values.q.trim() !== "" || values.status !== "" || values.source !== "";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        navigate(values);
      }}
      className="rounded-lg border border-border bg-background p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)_minmax(160px,220px)_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="inquiry-search">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="inquiry-search"
              type="search"
              placeholder="Name, phone, email or product"
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
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={values.status || null}
            onValueChange={(value) =>
              navigate({ ...values, status: value ?? "" })
            }
          >
            <SelectTrigger id="filter-status" className="w-full">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Any status</SelectItem>
              {inquiryStatusValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {inquiryStatusLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-source">Source</Label>
          <Select
            value={values.source || null}
            onValueChange={(value) =>
              navigate({ ...values, source: value ?? "" })
            }
          >
            <SelectTrigger id="filter-source" className="w-full">
              <SelectValue placeholder="Any source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Any source</SelectItem>
              {inquirySourceValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {inquirySourceLabel(value)}
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
              onClick={() => navigate({ q: "", status: "", source: "" })}
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