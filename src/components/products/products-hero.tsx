"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

const PRODUCTS_HERO_SLIDES = [
  "/images/product-hero.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
  "/images/hero-5.png",
];

const CROSSFADE_MS = 700;

const wrapSlide = (index: number) =>
  ((index % PRODUCTS_HERO_SLIDES.length) + PRODUCTS_HERO_SLIDES.length) %
  PRODUCTS_HERO_SLIDES.length;

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

function ProductsHeroBackdrop({
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
        {PRODUCTS_HERO_SLIDES.map((src, index) => {
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

function ProductsHeroNav({
  onPrevious,
  onNext,
  reducedMotion,
}: {
  onPrevious: () => void;
  onNext: () => void;
  reducedMotion: boolean;
}) {
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
        aria-label="Previous image"
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
        aria-label="Next image"
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

const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "sanitary-ware": "/images/sanitary-hero.png",
  tiles: "/images/tiles-hero.png",
  "building-materials": "/images/building-hero.png",
};

const CATEGORY_HERO_SUBTITLES: Record<string, string> = {
  "sanitary-ware": "Explore our sanitary ware collection",
  tiles: "Explore our tiles collection",
  "building-materials": "Explore our building materials collection",
};

interface ProductsHeroProps {
  title: string;
  description: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
  breadcrumbLinkClassName?: string;
  topPadding?: string;
  leftPadding?: string;
  categorySlug?: string;
}

function CategoryHero({
  title,
  subtitle,
  breadcrumbs,
  breadcrumbLinkClassName,
  topPadding,
  leftPadding,
  imageSrc,
  t,
  toneClass,
}: {
  title: string;
  subtitle: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
  breadcrumbLinkClassName?: string;
  topPadding?: string;
  leftPadding?: string;
  imageSrc: string;
  t: ReturnType<typeof useTranslations>;
  toneClass: {
    breadcrumb: string;
    hover: string;
    current: string;
    heading: string;
    description: string;
    glow: string;
  };
}) {
  return (
    <section className="relative overflow-hidden bg-navy-dark text-white lg:aspect-[5/1] lg:box-content lg:min-h-fit">
      <div
        aria-hidden="true"
        role="presentation"
        className="pointer-events-none relative aspect-[5/1] w-full overflow-hidden"
        style={{ isolation: "isolate" }}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="100vw"
          quality={80}
          priority
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-transparent"
        />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 z-10">
        <div className={cn("pointer-events-auto", topPadding, leftPadding, "pb-4 pr-4 sm:pr-6 lg:pr-8")}>
          <div className="relative">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-2">
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
                  <li className="flex items-center gap-1.5">
                    <span aria-hidden="true">/</span>
                    <Link
                      href="/products"
                      className={cn(
                        "transition-colors",
                        toneClass.hover,
                        breadcrumbLinkClassName
                      )}
                    >
                      {t.products.breadcrumb}
                    </Link>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span aria-hidden="true">/</span>
                    <span className={cn(toneClass.current, breadcrumbLinkClassName)}>
                      {title}
                    </span>
                  </li>
                </ol>
              </nav>
            )}

            <h1
              className={cn(
                "font-heading font-bold tracking-tight text-[clamp(1.5rem,4vw,2.5rem)] sm:text-[clamp(1.875rem,4vw,3rem)] lg:text-[clamp(2.25rem,4vw,3.5rem)]",
                toneClass.heading,
                toneClass.glow
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "mt-2 max-w-2xl text-sm leading-relaxed sm:text-base whitespace-pre-wrap",
                  toneClass.description,
                  toneClass.glow
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DefaultHero({
  title,
  description,
  breadcrumbs,
  breadcrumbLinkClassName,
  topPadding,
  leftPadding,
  active,
  previous,
  reducedMotion,
  showPrevious,
  showNext,
  toneClass,
}: {
  title: string;
  description: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
  breadcrumbLinkClassName?: string;
  topPadding?: string;
  leftPadding?: string;
  active: number;
  previous: number;
  reducedMotion: boolean;
  showPrevious: () => void;
  showNext: () => void;
  toneClass: {
    breadcrumb: string;
    hover: string;
    current: string;
    heading: string;
    description: string;
    glow: string;
  };
}) {
  return (
    <section className="relative overflow-hidden bg-navy-dark text-white lg:grid lg:aspect-[3/1] lg:box-content lg:min-h-fit">
      <ProductsHeroBackdrop
        active={active}
        previous={previous}
        reducedMotion={reducedMotion}
      />

      <div className="pointer-events-none absolute top-0 left-0 z-10">
        <div className={cn("pointer-events-auto", topPadding, leftPadding, "pb-3 pr-4 sm:pr-6 lg:pr-8")}>
          <div className="relative">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-2">
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
                  "mt-4 max-w-2xl text-base leading-relaxed sm:text-lg whitespace-pre-wrap",
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

      <ProductsHeroNav
        onPrevious={showPrevious}
        onNext={showNext}
        reducedMotion={reducedMotion}
      />
    </section>
  );
}

export function ProductsHero({
  title,
  description,
  breadcrumbs,
  breadcrumbLinkClassName,
  topPadding = "pt-3",
  leftPadding = "pl-0",
  categorySlug,
}: ProductsHeroProps) {
  const t = useTranslations();
  const { active, previous, reducedMotion, showPrevious, showNext } =
    useManualSlider();

  const toneClass = {
    breadcrumb: "text-white",
    hover: "hover:text-white",
    current: "text-white",
    heading: "text-white",
    description: "text-white",
    glow: "",
  };

  const isCategoryHero = !!categorySlug && categorySlug in CATEGORY_HERO_IMAGES;
  const categoryImage = isCategoryHero ? CATEGORY_HERO_IMAGES[categorySlug] : null;
  const categorySubtitle = isCategoryHero ? CATEGORY_HERO_SUBTITLES[categorySlug] : description;

  if (isCategoryHero && categoryImage) {
    return (
      <CategoryHero
        title={title}
        subtitle={categorySubtitle}
        breadcrumbs={breadcrumbs}
        breadcrumbLinkClassName={breadcrumbLinkClassName}
        topPadding={topPadding}
        leftPadding={leftPadding}
        imageSrc={categoryImage}
        t={t}
        toneClass={toneClass}
      />
    );
  }

  return (
    <DefaultHero
      title={title}
      description={description}
      breadcrumbs={breadcrumbs}
      breadcrumbLinkClassName={breadcrumbLinkClassName}
      topPadding={topPadding}
      leftPadding={leftPadding}
      active={active}
      previous={previous}
      reducedMotion={reducedMotion}
      showPrevious={showPrevious}
      showNext={showNext}
      toneClass={toneClass}
    />
  );
}