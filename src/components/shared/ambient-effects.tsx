"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * FloatingBubbles - Simple, premium floating bubble effect
 *
 * Creates a small number of soft translucent bubbles with a gentle inner glow.
 * Bubbles float slowly and naturally using CSS transform/opacity animations.
 * No blur filters, no JavaScript animation loops, minimal DOM elements.
 *
 * Features:
 * - 8-12 bubbles (configurable)
 * - Soft translucent appearance with subtle inner light
 * - Smooth CSS-driven float animation (transform + opacity)
 * - Theme-aware via CSS custom properties (light/dark)
 * - Respects prefers-reduced-motion
 * - Pointer-events: none, fixed positioning, z-0 layer
 * - Zero layout impact
 */
interface FloatingBubblesProps {
  /** Number of bubbles (default: 10) */
  count?: number;
  /** Custom className */
  className?: string;
  /** Whether to respect prefers-reduced-motion (default: true) */
  respectReducedMotion?: boolean;
  /** Z-index layer (default: 0) */
  zIndex?: number;
}

export function FloatingBubbles({
  count = 10,
  className,
  respectReducedMotion = true,
  zIndex = 0,
}: FloatingBubblesProps) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!respectReducedMotion) {
      setReducedMotion(false);
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [respectReducedMotion]);

  if (!mounted || reducedMotion) return null;

  // Pre-generate bubble properties for consistent animation
  const bubbles = Array.from({ length: count }, (_, i) => {
    // Distribute bubbles across the viewport with some randomness
    const x = 5 + (i / Math.max(count - 1, 1)) * 85 + (Math.random() - 0.5) * 15;
    const y = 10 + Math.random() * 80;
    const size = 60 + Math.random() * 100; // 60-160px
    const duration = 35 + Math.random() * 25; // 35-60s
    const delay = Math.random() * 15; // 0-15s stagger
    const driftX = -8 + Math.random() * 16; // -8% to 8%
    const driftY = -12 + Math.random() * 8; // -12% to -4% (slight upward drift)
    const opacity = 0.12 + Math.random() * 0.1; // 0.12-0.22
    const floatVariant = i % 3; // 3 animation variants

    return {
      x: Math.max(0, Math.min(100, x)),
      y,
      size,
      duration,
      delay,
      driftX,
      driftY,
      opacity,
      floatVariant,
    };
  });

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden",
        `z-[${zIndex}]`,
        className
      )}
      aria-hidden="true"
    >
      {bubbles.map((bubble, index) => (
        <div
          key={index}
          className="floating-bubble"
          style={{
            position: "absolute",
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animation: `fx-bubble-float-${bubble.floatVariant} ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
            pointerEvents: "none",
            // CSS variables for per-bubble animation parameters
            "--bubble-drift-x": `${bubble.driftX}%`,
            "--bubble-drift-y": `${bubble.driftY}%`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}