import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const delayClass =
    delay <= 0 ? "" : delay <= 0.1 ? "reveal-d1" : delay <= 0.2 ? "reveal-d2" : "reveal-d3";

  return (
    <div className={cn("reveal", delayClass, className)}>
      {children}
    </div>
  );
}
