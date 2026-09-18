import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring",
  outline:
    "border border-border text-foreground hover:bg-muted focus-visible:ring-ring",
  inverse:
    "bg-secondary text-secondary-foreground hover:bg-gold-light focus-visible:ring-gold focus-visible:ring-offset-navy-dark",
  "outline-inverse":
    "border border-white/30 text-white hover:bg-white/10 focus-visible:ring-white/60 focus-visible:ring-offset-navy-dark",
} as const;

const sizes = {
  md: "h-11 px-6",
  lg: "h-12 gap-2 px-7",
} as const;

type ButtonLinkVariant = keyof typeof variants;
type ButtonLinkSize = keyof typeof sizes;

interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: ButtonLinkVariant;
  size?: ButtonLinkSize;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}