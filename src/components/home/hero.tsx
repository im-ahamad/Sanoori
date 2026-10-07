"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

/**
 * Manual hero gallery — always starts on `main-hero.png` and only advances
 * when the visitor presses an arrow button. There is no timer and no
 * automatic rotation.
 *
 * Order: main-hero → hero-2 → hero-3 → hero-4 → hero-5 → main-hero …
 */
const HERO_SLIDES = [
  "/images/main-hero.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
  "/images/hero-5.png",
];

/** Milliseconds of the crossfade between two slides. */
const CROSSFADE_MS = 700;

const wrapSlide = (index: number) =>
  ((index % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length;

/**
 * Horizontal focal point per breakpoint.
 *
 * Below lg the backdrop box matches the slides' own 1942:809 ratio, so there
 * is no slack to align into and the percentage positions are inert. At lg+ the
 * box becomes 3:1 (the /about hero geometry), which is wider than the ~2.4:1
 * slides: `object-contain` keeps every slide whole and undistorted and centres
 * it, leaving symmetric navy margins. A `60%/64%` horizontal anchor would
 * shove the contained image off-centre in that margin, so lg/xl centre.
 */
const HERO_OBJECT_POSITION =
  "object-center sm:object-[60%_center] md:object-[55%_center] lg:object-center xl:object-center";

const HERO_OVERLAY =
  "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_48%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_28%,transparent)_30%,color-mix(in_oklab,var(--navy-dark)_12%,transparent)_58%,transparent_80%)]";

/** Aspect ratio matching the About hero (3:1) for consistent vertical space at lg+. */
const HERO_ASPECT = "aspect-[3/1]";

type SlideState = { active: number; previous: number };

/**
 * State for the manual gallery.
 */
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

/**
 * Full-width hero image band at the images' own 1942:809 ratio.
 */
function HeroBackdrop({
  active,
  previous,
  reducedMotion,
}: SlideState & { reducedMotion: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        role="presentation"
        className="pointer-events-none relative aspect-[1942/809] w-full overflow-hidden lg:aspect-[3/1] lg:col-start-1 lg:row-start-1"
        style={{ isolation: "isolate" }}
      >
        {HERO_SLIDES.map((src, index) => {
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
                "object-contain lg:object-cover",
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
        className={cn("pointer-events-none absolute inset-0", HERO_OVERLAY, "sanoori-hero-overlay")}
      />
    </>
  );
}

/**
 * Navigation arrows pinned to the hero image edges.
 */
function HeroNav({
  onPrevious,
  onNext,
  reducedMotion,
}: {
  onPrevious: () => void;
  onNext: () => void;
  reducedMotion: boolean;
}) {
  const t = useTranslations();

  /**
   * Arrows keep their original footprint (`size-9` → `sm:size-10` → `lg:size-12`)
   * and position. Only the surface colour and interaction feedback change.
   *
   * Surface: solid brand gold (`--gold`, the same token the Browse Products CTA
   * uses) with a metallic `gold-light → gold → gold-dark` gradient and a navy
   * icon, so the control is opaque and unmistakable against any hero image.
   *
   * Always-on life: a breathing gold halo plus a slow diagonal light sweep.
   * Both are decorative, hidden below `sm`, and disabled by
   * `prefers-reduced-motion` in `globals.css`.
   */
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

  /** Breathing gold halo — the ambient "live" cue. */
  const glowClass =
    "pointer-events-none absolute -inset-1.5 hidden rounded-full bg-gold/60 blur-lg sm:block hero-arrow-glow";

  /** Wider halo that only appears on hover, so hover reads as more glow. */
  const glowHoverClass =
    "pointer-events-none absolute -inset-3 hidden rounded-full bg-gold/50 blur-xl opacity-0 transition-opacity duration-300 sm:block group-hover:opacity-100";

  /** Slow diagonal light sweep across the gold surface. */
  const sheenClass =
    "pointer-events-none absolute inset-0 hidden overflow-hidden rounded-full sm:block";

  const sheenBarClass =
    "absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent hero-arrow-sheen";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-[1942/809] items-center justify-between px-4 sm:px-6 lg:aspect-[3/1] lg:px-8">
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


export function Hero() {
  const t = useTranslations();
  const { active, previous, reducedMotion, showPrevious, showNext } =
    useManualSlider();

  const motion = reducedMotion ? "duration-0" : "duration-700";

  return (
    <section className="relative overflow-hidden bg-navy-dark text-white lg:grid lg:aspect-[3/1] lg:box-content lg:min-h-fit sanoori-hero">
      {/* Full-width hero image (natural ratio, manual navigation) + navy wash */}
      <HeroBackdrop
        active={active}
        previous={previous}
        reducedMotion={reducedMotion}
      />

      {/* Overlays the image on desktop; stacks below it on narrow screens */}
      <div className="relative h-full w-full px-4 sm:px-6 lg:px-8 lg:col-start-1 lg:row-start-1">
        <div className={cn("flex h-full items-start pt-10 sm:pt-12 lg:pt-6 transition-all", motion)}>
          <div className={cn("w-full max-w-7xl lg:ml-20 transition-all", motion)}>
            <div className={cn("transition-all", motion, "max-w-[48rem]")}>
              <p
                className={cn(
                  "hero-intro flex items-center gap-3 font-bold uppercase tracking-[0.14em] text-gold transition-all",
                  motion,
                  "lg:gap-2 xl:gap-3",
                  active !== 0
                    ? "text-[12px] lg:text-[calc(0.7rem_-_3px)] xl:text-[calc(0.78rem_-_3px)]"
                    : "text-[12px] lg:text-[0.7rem] xl:text-[0.78rem]"
                )}
              >
                <span className={cn("h-px w-8 bg-gold/60", "lg:w-6 xl:w-8")} aria-hidden="true" />
                {t.hero.eyebrow}
              </p>

              <h1
                className={cn(
                  "hero-intro hero-intro-d1 font-heading font-semibold tracking-tight text-white transition-all",
                  motion,
                  "mt-4 leading-[0.98]",
                  active === 0
                    ? "clamp-text-4xl-6xl"
                    : "clamp-text-4xl-6xl [font-size:clamp(calc(2.5rem_-_1px),calc(6vw_-_15px),calc(5.5rem_-_16px))]"
                )}
              >
                {t.hero.title}
              </h1>

              <div className={cn("transition-all", motion, "max-h-80 opacity-100")}>
                <p
                  className={cn(
                    "hero-intro hero-intro-d2 mt-5 max-w-[32rem] leading-[1.7] text-white/85 sm:leading-[1.8] lg:leading-[2rem] transition-all",
                    motion,
                    active !== 0
                      ? "text-[calc(0.875rem_-_3px)] sm:text-[calc(1rem_-_3px)] lg:text-[calc(1.125rem_-_3px)]"
                      : "text-sm sm:text-base lg:text-lg"
                  )}
                >
                  {t.hero.description}
                </p>
              </div>

              <div
                className={cn(
                  "hero-intro hero-intro-d3 flex transition-all",
                  motion,
                  "mt-8 flex-wrap gap-2 sm:items-center",
                  active === 0 ? "pe-[111px]" : "pe-[170px]"
                )}
              >
                <ButtonLink
                  href="/products"
                  variant="inverse"
                  size="lg"
                  className="w-full sm:w-auto min-w-0 flex-1"
                >
                  {t.hero.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              </div>

              <div className="hidden md:block absolute bottom-0 left-0 border-t border-r border-white/10 bg-navy-dark/50 px-5 py-4 text-xs text-white/60">
                {t.hero.footer}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual prev/next arrows — last child so they sit above the wash */}
      <HeroNav
        onPrevious={showPrevious}
        onNext={showNext}
        reducedMotion={reducedMotion}
      />
    </section>
  );
}