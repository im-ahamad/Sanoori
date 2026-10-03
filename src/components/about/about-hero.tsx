"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

const ABOUT_HERO_SLIDES = [
  "/images/about-hero.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
  "/images/hero-5.png",
];

const CROSSFADE_MS = 700;

const wrapSlide = (index: number) =>
  ((index % ABOUT_HERO_SLIDES.length) + ABOUT_HERO_SLIDES.length) %
  ABOUT_HERO_SLIDES.length;

const HERO_OBJECT_POSITION = "object-center";

const HERO_OVERLAY = "";

type SlideState = { active: number; previous: number };

function useManualSlider() {
  const [slides, setSlides] = useState<SlideState>({ active: 0, previous: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const busyRef = useRef(false);
  const queuedRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const navigate = useCallback(
    (step: number) => {
      const advance = (delta: number) =>
        setSlides((current) => ({
          active: wrapSlide(current.active + delta),
          previous: current.active,
        }));

      if (reducedMotion) {
        advance(step);
        return;
      }

      if (busyRef.current) {
        queuedRef.current += step;
        return;
      }

      busyRef.current = true;
      advance(step);

      const unlockLater = () => {
        timerRef.current = window.setTimeout(() => {
          const queued = queuedRef.current;
          queuedRef.current = 0;
          if (queued === 0) {
            busyRef.current = false;
            return;
          }
          advance(queued);
          unlockLater();
        }, CROSSFADE_MS);
      };
      unlockLater();
    },
    [reducedMotion]
  );

  return {
    active: slides.active,
    previous: slides.previous,
    reducedMotion,
    showPrevious: useCallback(() => navigate(-1), [navigate]),
    showNext: useCallback(() => navigate(1), [navigate]),
  };
}

function AboutHeroBackdrop({
  active,
  previous,
  reducedMotion,
}: SlideState & { reducedMotion: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        role="presentation"
        className="pointer-events-none relative aspect-[3/1] w-full overflow-hidden"
        style={{ isolation: "isolate" }}
      >
        {ABOUT_HERO_SLIDES.map((src, index) => {
          const isActive = index === active;
          const isPrevious = index === previous;
          return (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="100vw"
              quality={60}
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              className={cn(
                "object-cover",
                HERO_OBJECT_POSITION,
                isActive || isPrevious ? "opacity-100" : "opacity-0"
              )}
              style={{
                zIndex: isActive ? 2 : isPrevious ? 1 : 0,
                transition: reducedMotion
                  ? "none"
                  : `opacity ${CROSSFADE_MS}ms ease-in-out`,
              }}
            />
          );
        })}
      </div>
      <div
        aria-hidden="true"
        role="presentation"
        className={cn("pointer-events-none absolute inset-0", HERO_OVERLAY)}
      />
    </>
  );
}

function AboutHeroNav({
  onPrevious,
  onNext,
  reducedMotion,
}: {
  onPrevious: () => void;
  onNext: () => void;
  reducedMotion: boolean;
}) {
  const t = useTranslations();

  const controlClass = cn(
    "pointer-events-auto relative flex size-9 cursor-pointer items-center justify-center rounded-full select-none",
    "bg-linear-to-br from-gold-light via-gold to-gold-dark text-navy-dark",
    "border border-gold-light/70",
    "shadow-[0_6px_18px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]",
    "transition-[filter,box-shadow,scale] duration-300 ease-out",
    "hover:brightness-110 hover:shadow-[0_10px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.55)]",
    "active:brightness-95 active:duration-75",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-dark/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40",
    "motion-reduce:transition-none",
    "sm:size-10 lg:size-12",
    !reducedMotion && "hover:scale-[1.06] active:scale-[0.94]"
  );

  const glowClass =
    "pointer-events-none absolute -inset-1.5 hidden rounded-full bg-gold/60 blur-lg sm:block hero-arrow-glow";

  const glowHoverClass =
    "pointer-events-none absolute -inset-3 hidden rounded-full bg-gold/50 blur-xl opacity-0 transition-opacity duration-300 sm:block group-hover:opacity-100";

  const sheenClass =
    "pointer-events-none absolute inset-0 hidden overflow-hidden rounded-full sm:block";

  const sheenBarClass =
    "absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent hero-arrow-sheen";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-[3/1] items-center justify-between px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onPrevious}
        aria-label={t.hero.prevImage}
        className={cn("group", controlClass)}
      >
        <span aria-hidden="true" className={glowHoverClass} />
        <span aria-hidden="true" className={glowClass} />
        <span aria-hidden="true" className={sheenClass}>
          <span className={sheenBarClass} />
        </span>
        <ArrowLeft className="relative size-4 sm:size-5" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label={t.hero.nextImage}
        className={cn("group", controlClass)}
      >
        <span aria-hidden="true" className={glowHoverClass} />
        <span aria-hidden="true" className={glowClass} />
        <span aria-hidden="true" className={sheenClass}>
          <span className={sheenBarClass} />
        </span>
        <ArrowRight className="relative size-4 sm:size-5" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}

interface AboutHeroProps {
  title: string;
  description: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
  breadcrumbLinkClassName?: string;
}

export function AboutHero({
  title,
  description,
  breadcrumbs,
  breadcrumbLinkClassName,
}: AboutHeroProps) {
  const t = useTranslations();
  const { active, previous, reducedMotion, showPrevious, showNext } =
    useManualSlider();

  const motion = reducedMotion ? "duration-0" : "duration-700";

  const toneClass = {
    breadcrumb: "text-white",
    hover: "hover:text-white",
    current: "text-white",
    heading: "text-white",
    description: "text-white",
    glow: "[text-shadow:0_1px_1px_rgba(12,10,8,0.5),0_0_3px_rgba(12,10,8,0.35),0_0_8px_rgba(12,10,8,0.28)]",
  };

  return (
    <section className="relative overflow-hidden bg-navy-dark text-white lg:grid lg:aspect-[3/1] lg:box-content lg:min-h-fit">
      <AboutHeroBackdrop
        active={active}
        previous={previous}
        reducedMotion={reducedMotion}
      />

      {/* Content positioned absolute to hero section top-left */}
      <div className="pointer-events-none absolute top-0 left-0 z-10">
        <div className="pointer-events-auto pl-[110px] pt-[30px] pb-3 pr-4 sm:pl-[110px] sm:pt-[30px] sm:pb-3 sm:pr-6 lg:pl-[110px] lg:pt-[30px] lg:pb-3 lg:pr-8">
          <div className="relative">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-1">
                  <ol
                    className={cn(
                      "flex items-center gap-1.5 text-xs sm:text-sm",
                      toneClass.breadcrumb,
                      toneClass.glow
                    )}
                  >
                    <li>
                      <Link
                        href="/"
                        className={cn(
                          "transition-colors",
                          toneClass.hover,
                          breadcrumbLinkClassName
                        )}
                      >
                        Home
                      </Link>
                    </li>
                    {breadcrumbs.map((crumb, index) => (
                      <li key={`breadcrumb-${crumb.href}`} className="flex items-center gap-1.5">
                        <span aria-hidden="true">/</span>
                        {index === breadcrumbs.length - 1 ? (
                          <span
                            className={cn(
                              toneClass.current,
                              breadcrumbLinkClassName
                            )}
                          >
                            {crumb.label}
                          </span>
                        ) : (
                          <Link
                            href={crumb.href}
                            className={cn(
                              "transition-colors",
                              toneClass.hover,
                              breadcrumbLinkClassName
                            )}
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <h1
                className={cn(
                  "font-heading font-bold tracking-tight text-[clamp(1.875rem,5vw,3rem)] sm:text-[clamp(2.25rem,5vw,3.5rem)] lg:text-[clamp(3rem,5vw,4rem)]",
                  toneClass.heading,
                  toneClass.glow
                )}
              >
                {title}
              </h1>
              {description && (
                <p
                  className={cn(
                    "mt-4 max-w-2xl text-base leading-relaxed sm:text-lg",
                    toneClass.description,
                    toneClass.glow
                  )}
                >
                  {description}
                </p>
              )}
            </div>
        </div>
      </div>

      <AboutHeroNav
        onPrevious={showPrevious}
        onNext={showNext}
        reducedMotion={reducedMotion}
      />
    </section>
  );
}