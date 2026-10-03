import Link from "next/link";
import { Container } from "@/components/layout/container";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
  backgroundImage?: string;
  backdropOverlay?: string;
  objectFit?: string;
  objectPosition?: string;
  unoptimized?: boolean;
  noZoom?: boolean;
  /** Extra classes for the background image wrapper (e.g. to inset the image
   * edge inside the hero). Applies to the VisualBackdrop positioning box. */
  backdropClassName?: string;
  /** Extra classes for the hero <img> element itself (applies to the
   * VisualBackdrop image layer, e.g. to nudge its rendered position). */
  imageClassName?: string;
  /** Use the brand deep-navy color for the header text so white copy stays
   * readable over bright imagery. Off by default (white text). */
  navyText?: boolean;
  /** Add a tightly localized, softly fading atmospheric shadow behind the text
   * block to keep copy readable over bright imagery. Off by default. */
  textScrim?: boolean;
  /** Text tone for the header copy. "white" and "navy" preserve the default /
   * brand-navy behavior; "slate" is a deep cool graphite-teal chosen for
   * strong contrast over bright warm imagery; "green" is a premium emerald
   * picked for the /products hero over its dark-leaning stone photograph,
   * sharing the same dark halo as ivory for separation. Takes precedence
   * over `navyText`. */
  textColor?: "white" | "navy" | "slate" | "green" | "pureWhite" | "gold";
  /** Position the header copy inside the section. "center" uses the shared
   * centered container; "top-left" anchors the content to the top-left edge
   * with the hero content's gutter, like the home hero. Defaults to "center". */
  placement?: "center" | "top-left";
  /** Center the whole copy block at exactly 50% horizontal + 50% vertical of
   * the hero section (flex items-center justify-center). Text stays left
   * aligned inside the block. Off by default. */
  exactCenter?: boolean;
  /** Override the vertical top inset for the "top-left" placement. Defaults
   * to the standard "pt-16 sm:pt-20 lg:pt-24" padding (used by About). */
  topPadding?: string;
  /** Override the horizontal left inset for the "top-left" placement.
   * Defaults to the standard negative margin "lg:-ml-32". */
  leftPadding?: string;
  /** Extra classes for the breadcrumb link/crumb text (font size, etc.).
   * Applied to the crumb text while keeping its existing color and spacing. */
  breadcrumbLinkClassName?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backgroundImage,
  backdropOverlay,
  objectFit,
  objectPosition,
  unoptimized,
  noZoom,
  backdropClassName,
  imageClassName,
  navyText = false,
  textScrim = false,
  placement = "center",
  exactCenter = false,
  topPadding,
  leftPadding,
  breadcrumbLinkClassName,
  textColor,
  className,
}: PageHeaderProps) {
  const tone =
    textColor ?? (navyText ? "navy" : "white");

  const toneClasses: Record<
    "white" | "navy" | "slate" | "green" | "pureWhite" | "gold",
    {
      breadcrumb: string;
      hover: string;
      current: string;
      heading: string;
      description: string;
      glow: string;
    }
  > = {
    white: {
      breadcrumb: "text-white/70",
      hover: "hover:text-white",
      current: "text-white",
      heading: "text-white",
      description: "text-white/80",
      glow: "",
    },
    navy: {
      breadcrumb: "text-navy-dark/75",
      hover: "hover:text-navy-dark",
      current: "text-navy-dark",
      heading: "text-navy-dark",
      description: "text-navy-dark/85",
      glow: "",
    },
    slate: {
      breadcrumb: "text-[oklch(0.10_0.05_210)]/75",
      hover: "hover:text-[oklch(0.10_0.05_210)]",
      current: "text-[oklch(0.10_0.05_210)]",
      heading: "text-[oklch(0.10_0.05_210)]",
      description: "text-[oklch(0.10_0.05_210)]/85",
      glow: "[text-shadow:0_1px_1px_rgba(20,24,28,0.35),0_0_2px_rgba(255,248,235,0.5)]",
    },
    green: {
      breadcrumb: "text-[#10B981]/80",
      hover: "hover:text-[#10B981]",
      current: "text-[#10B981]",
      heading: "text-[#10B981]",
      description: "text-[#10B981]/90",
      glow: "[text-shadow:0_1px_1px_rgba(12,10,8,0.5),0_0_3px_rgba(12,10,8,0.35),0_0_8px_rgba(12,10,8,0.28)]",
    },
    /** Brand gold — the same `--gold` token that surfaces the Home hero
     *  navigation arrow buttons (`from-gold-light via-gold to-gold-dark`),
     *  reused verbatim so both heroes share one exact value. Keeps the
     *  `pureWhite` dark halo so gold copy stays legible over bright imagery. */
    gold: {
      breadcrumb: "text-gold",
      hover: "hover:text-gold",
      current: "text-gold",
      heading: "text-gold",
      description: "text-gold",
      glow: "[text-shadow:0_1px_1px_rgba(12,10,8,0.5),0_0_3px_rgba(12,10,8,0.35),0_0_8px_rgba(12,10,8,0.28)]",
    },
  pureWhite: {
      breadcrumb: "text-white",
      hover: "hover:text-white",
      current: "text-white",
      heading: "text-white",
      description: "text-white",
      glow: "",
    },
  };
  const toneClass = toneClasses[tone];
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-white/10 bg-navy-dark text-white",
        exactCenter && "flex items-start justify-center",
        className
      )}
    >
      <VisualBackdrop
        variant="header"
        src={backgroundImage}
        overlayClassName={backdropOverlay}
        objectFit={objectFit}
        objectPosition={objectPosition}
        priority
        unoptimized={unoptimized}
        noZoom={noZoom}
        className={backdropClassName}
        imageClassName={imageClassName}
      />
      {placement === "top-left" ? (
        <div className="relative w-full">
          <div className={cn("relative w-full pr-4 sm:pr-6 lg:pr-8", leftPadding ?? "lg:-ml-32")}>
            <div className={cn(topPadding ?? "pt-16 sm:pt-20 lg:pt-24", "pb-10")}>
              <div className="relative">
                {textScrim && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 -top-12 -bottom-8 w-[46rem] max-w-full -ml-2 bg-[radial-gradient(ellipse_80%_85%_at_18%_42%,color-mix(in_oklab,var(--navy-dark)_18%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_7%,transparent)_50%,transparent_76%)]"
                  />
                )}
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav aria-label="Breadcrumb" className="mb-2">
                    <ol
                      className={cn(
                        "flex items-center gap-1.5 text-xs sm:text-sm",
                        textColor
                          ? toneClass.breadcrumb
                          : navyText
                            ? "text-navy-dark/75"
                            : "text-gold-light/70",
                        textColor ? toneClass.glow : ""
                      )}
                    >
                      <li>
                        <Link
                          href="/"
                          className={cn(
                            "transition-colors",
                            textColor
                              ? toneClass.hover
                              : navyText
                                ? "hover:text-navy-dark"
                                : "hover:text-gold-light",
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
                                textColor
                                  ? toneClass.current
                                  : navyText
                                    ? "text-navy-dark"
                                    : "text-gold-light",
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
                                textColor
                                  ? toneClass.hover
                                  : "hover:text-gold-light",
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
                    textColor
                      ? toneClass.heading
                      : navyText
                        ? "text-navy-dark"
                        : "text-gold-light",
                    textColor ? toneClass.glow : ""
                  )}
                >
                  {title}
                </h1>
                {description && (
                  <p
                    className={cn(
                      "mt-4 max-w-2xl text-base leading-relaxed sm:text-lg whitespace-pre-wrap",
                      textColor
                        ? toneClass.description
                        : navyText
                          ? "text-navy-dark/85"
                          : "text-gold-light/85",
                      textColor ? toneClass.glow : ""
                    )}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Container className="relative">
          <div
            className={cn(
              exactCenter
                ? "flex w-full justify-center"
                : "py-12 sm:py-16 lg:py-20"
            )}
            style={exactCenter ? { transform: "translateY(30px)" } : undefined}
          >
            <div
              className={cn(
                exactCenter
                  ? "flex w-fit flex-col items-center justify-center text-center pt-6 sm:pt-8"
                  : "",
                topPadding
              )}
            >
              {textScrim && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 -top-12 -bottom-8 w-[46rem] max-w-full -ml-2 bg-[radial-gradient(ellipse_80%_85%_at_18%_42%,color-mix(in_oklab,var(--navy-dark)_18%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_7%,transparent)_50%,transparent_76%)]"
                />
              )}
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
        </Container>
      )}
    </section>
  );
}