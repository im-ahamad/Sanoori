"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { productImageHero, productImageThumb } from "@/lib/cloudinary-url";
import { ProductImagePlaceholder } from "@/components/products/product-image-placeholder";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  hideThumbnails?: boolean;
}

/** Gap kept between the original image and the magnifier panel. */
const ZOOM_GAP = 12;
/** Space kept between the panel and the viewport / clipping edges. */
const ZOOM_EDGE = 16;
/** Panel width bounds — the panel shrinks when the right side gets tight. */
const ZOOM_MAX_PANEL = 720;
const ZOOM_MIN_PANEL = 200;
/** Preferred magnification, clamped to what the high-resolution source allows. */
const ZOOM_MAGNIFICATION = 2.5;
/** Opacity fade only — the zoom movement itself is never animated. */
const ZOOM_FADE_MS = 150;

/** One magnifier frame, all measurements taken from the rendered `<img>`. */
interface ZoomFrame {
  /** Panel position relative to the gallery root. */
  panelLeft: number;
  panelTop: number;
  panelWidth: number;
  panelHeight: number;
  /** Lens position relative to the image box. */
  lensLeft: number;
  lensTop: number;
  lensWidth: number;
  lensHeight: number;
  /** Magnified source placement inside the panel. */
  imageLeft: number;
  imageTop: number;
  imageWidth: number;
  imageHeight: number;
  src: string;
}

function clamp(value: number, min: number, max: number): number {
  if (!(max > min)) return min;
  return value < min ? min : value > max ? max : value;
}

/**
 * Responsive image gallery with an Amazon-style two-panel magnifier.
 * - Left: Original image at normal size (unchanged)
 * - Right: Magnified preview panel overlaying the free space beside the image
 * - Desktop (fine pointer only): hover to zoom, lens tracks the cursor
 * - Mobile / touch: normal image behavior (no zoom panel, no lens)
 */
export function ProductGallery({ images, productName, hideThumbnails }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canUseZoom, setCanUseZoom] = useState(false);
  const [zoomFrame, setZoomFrame] = useState<ZoomFrame | null>(null);
  const [isZoomVisible, setIsZoomVisible] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const activeRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const clipElRef = useRef<HTMLElement | null>(null);
  const headerElRef = useRef<HTMLElement | null>(null);
  const hiResRef = useRef<{ width: number; height: number } | null>(null);

  const selected =
    images[selectedIndex] ?? { id: "fallback", url: "", alt: null };

  const selectedAlt =
    selected.alt ?? `${productName} product image ${selectedIndex + 1} of ${images.length}`;

  const displayImageUrl = selected.url ? productImageHero(selected.url, 1080) : "";
  const zoomImageUrl = selected.url ? productImageHero(selected.url, 2000) : "";

  /**
   * Locate the elements that bound the panel: the nearest clipping ancestor
   * (so the overlay is never cut off) and the sticky header.
   */
  const findAnchors = useCallback(() => {
    let clipEl: HTMLElement | null = null;
    let node: HTMLElement | null = rootRef.current;
    while (node && node !== document.body) {
      const style = window.getComputedStyle(node);
      if (
        /(hidden|clip|auto|scroll)/.test(style.overflowX) ||
        /(hidden|clip|auto|scroll)/.test(style.overflowY)
      ) {
        clipEl = node;
        break;
      }
      node = node.parentElement;
    }
    clipElRef.current = clipEl;
    headerElRef.current = document.querySelector<HTMLElement>("header");
  }, []);

  /** Build the next magnifier frame from the live layout. */
  const computeFrame = useCallback((): ZoomFrame | null => {
    const root = rootRef.current;
    const imageBox = mainImageRef.current;
    const pointer = pointerRef.current;
    if (!root || !imageBox || !pointer || !displayImageUrl) return null;

    // Measure the actual rendered <img> bounding rectangle — never the container.
    const imageEl = imageBox.querySelector("img");
    if (!imageEl) return null;
    const rect = imageEl.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return null;
    const rootRect = root.getBoundingClientRect();
    const boxRect = imageBox.getBoundingClientRect();

    // object-fit: contain → the real image content inside the <img> box.
    const naturalWidth = imageEl.naturalWidth;
    const naturalHeight = imageEl.naturalHeight;
    let contentWidth = rect.width;
    let contentHeight = rect.height;
    let contentLeft = 0;
    let contentTop = 0;
    if (naturalWidth > 0 && naturalHeight > 0) {
      const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
      contentWidth = naturalWidth * scale;
      contentHeight = naturalHeight * scale;
      contentLeft = (rect.width - contentWidth) / 2;
      contentTop = (rect.height - contentHeight) / 2;
    }
    if (contentWidth <= 0 || contentHeight <= 0) return null;

    // Space available to the right: never overflow the page or a clipped ancestor.
    const clipRect = clipElRef.current?.getBoundingClientRect();
    const headerRect = headerElRef.current?.getBoundingClientRect();
    const rightLimit = Math.min(
      window.innerWidth - ZOOM_EDGE,
      (clipRect ? clipRect.right : Number.POSITIVE_INFINITY) - ZOOM_EDGE
    );
    const bottomLimit = Math.min(
      window.innerHeight - ZOOM_EDGE,
      (clipRect ? clipRect.bottom : Number.POSITIVE_INFINITY) - ZOOM_EDGE
    );
    const topLimit = Math.max(
      headerRect ? Math.max(0, headerRect.bottom) : 0,
      clipRect ? clipRect.top : Number.NEGATIVE_INFINITY
    );

    // Panel sits immediately right of the image, top aligned with the image.
    const aspect = contentWidth / contentHeight;
    const panelWidth = Math.min(
      rightLimit - rect.right - ZOOM_GAP,
      (bottomLimit - rect.top) * aspect,
      (bottomLimit - topLimit) * aspect,
      ZOOM_MAX_PANEL
    );
    if (!Number.isFinite(panelWidth) || panelWidth < ZOOM_MIN_PANEL) return null;
    const panelHeight = panelWidth / aspect;
    const panelTopViewport = clamp(rect.top, topLimit, bottomLimit - panelHeight);
    const panelLeft = rect.right - rootRect.left + ZOOM_GAP;

    // Pointer position inside the real content, clamped at all four edges.
    const pointerX = clamp(pointer.x - rect.left - contentLeft, 0, contentWidth);
    const pointerY = clamp(pointer.y - rect.top - contentTop, 0, contentHeight);

    // Magnification: fills the panel, never exceeds the highest-res source.
    const hiRes = hiResRef.current;
    const sourceWidth = hiRes ? hiRes.width : naturalWidth;
    const sourceHeight = hiRes ? hiRes.height : naturalHeight;
    const source = hiRes && zoomImageUrl ? zoomImageUrl : displayImageUrl;
    const minMagnitude = Math.max(panelWidth / contentWidth, panelHeight / contentHeight);
    const maxMagnitude =
      sourceWidth > 0 && sourceHeight > 0
        ? Math.min(sourceWidth / contentWidth, sourceHeight / contentHeight)
        : Number.POSITIVE_INFINITY;
    const magnitude = Math.max(minMagnitude, Math.min(ZOOM_MAGNIFICATION, maxMagnitude));

    // Lens shares the panel aspect ratio and always fits inside the image.
    const lensWidth = panelWidth / magnitude;
    const lensHeight = panelHeight / magnitude;
    const lensX = clamp(pointerX - lensWidth / 2, 0, contentWidth - lensWidth);
    const lensY = clamp(pointerY - lensHeight / 2, 0, contentHeight - lensHeight);

    return {
      panelLeft,
      panelTop: panelTopViewport - rootRect.top,
      panelWidth,
      panelHeight,
      lensLeft: contentLeft + lensX - (boxRect.left - rect.left),
      lensTop: contentTop + lensY - (boxRect.top - rect.top),
      lensWidth,
      lensHeight,
      imageLeft: -lensX * magnitude,
      imageTop: -lensY * magnitude,
      imageWidth: contentWidth * magnitude,
      imageHeight: contentHeight * magnitude,
      src: source,
    };
  }, [displayImageUrl, zoomImageUrl]);

  const runUpdate = useCallback(() => {
    if (!activeRef.current) return;
    setZoomFrame(computeFrame());
  }, [computeFrame]);

  /** Coalesce pointer/scroll/resize events into one measurement per frame. */
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      runUpdate();
    });
  }, [runUpdate]);

  const stopTracking = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const resetZoom = useCallback(() => {
    activeRef.current = false;
    pointerRef.current = null;
    stopTracking();
    if (fadeRafRef.current !== null) {
      window.cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsZoomVisible(false);
    setZoomFrame(null);
  }, [stopTracking]);

  const activateZoom = (clientX: number, clientY: number) => {
    pointerRef.current = { x: clientX, y: clientY };
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (activeRef.current) {
      scheduleUpdate();
      return;
    }
    activeRef.current = true;
    findAnchors();
    scheduleUpdate();
    // Fade in only after the first (transparent) panel frame has painted.
    fadeRafRef.current = window.requestAnimationFrame(() => {
      fadeRafRef.current = window.requestAnimationFrame(() => {
        fadeRafRef.current = null;
        if (activeRef.current) setIsZoomVisible(true);
      });
    });
  };

  const deactivateZoom = () => {
    activeRef.current = false;
    pointerRef.current = null;
    stopTracking();
    if (fadeRafRef.current !== null) {
      window.cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
    setIsZoomVisible(false);
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      if (!activeRef.current) setZoomFrame(null);
    }, ZOOM_FADE_MS + 40);
  };

  // Zoom only on desktop-class viewports with a fine (mouse/trackpad) pointer —
  // mobile and touch devices keep the original non-zooming behavior.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setCanUseZoom(window.innerWidth >= 1024 && finePointer.matches);
    };
    sync();
    window.addEventListener("resize", sync);
    finePointer.addEventListener("change", sync);
    return () => {
      window.removeEventListener("resize", sync);
      finePointer.removeEventListener("change", sync);
    };
  }, []);

  // Warm up the highest-resolution source so the first hover is instant.
  // Only preload on devices where zoom is actually usable (desktop with fine pointer).
  useEffect(() => {
    if (!canUseZoom) return;
    hiResRef.current = null;
    if (!zoomImageUrl) return;
    const loader = new window.Image();
    loader.decoding = "async";
    loader.onload = () => {
      if (loader.naturalWidth === 0) return;
      hiResRef.current = { width: loader.naturalWidth, height: loader.naturalHeight };
      if (activeRef.current) scheduleUpdate();
    };
    loader.src = zoomImageUrl;
    return () => {
      loader.onload = null;
    };
  }, [zoomImageUrl, canUseZoom, scheduleUpdate]);

  // Keep the magnifier exact while the page scrolls or the viewport changes.
  useEffect(() => {
    const onScroll = () => {
      if (activeRef.current) scheduleUpdate();
    };
    const onResize = () => {
      if (!activeRef.current) return;
      findAnchors();
      scheduleUpdate();
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
    };
  }, [findAnchors, scheduleUpdate]);

  // A changed product image (or zoom capability) starts from a clean state.
  useEffect(() => {
    return () => resetZoom();
  }, [selectedIndex, canUseZoom, resetZoom]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canUseZoom) return;
    activateZoom(event.clientX, event.clientY);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canUseZoom) return;
    activateZoom(event.clientX, event.clientY);
  };

  const handleMouseLeave = () => {
    deactivateZoom();
  };

  const handleTouchStart = () => {
    deactivateZoom();
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        // The trailing column is a thumbnail rail, so it is only reserved when
        // thumbnails are actually rendered — otherwise it is dead space beside
        // the image (this page hides them). The `lg` (>=1024px) rail is kept
        // unconditionally: it is part of the approved desktop layout.
        "grid grid-cols-1 gap-3 relative lg:grid-cols-[minmax(0,1fr)_88px] lg:items-start",
        !hideThumbnails && "md:grid-cols-[minmax(0,1fr)_72px]"
      )}
    >
      {/* Main image — below `lg` the box follows the image's own aspect ratio.
          Delivered URLs use `c_limit`, so they are never square: a fixed 1:1 box
          letterboxed ~33% of the area for landscape/portrait shots and shrank
          the product. In flow at its natural ratio the image fills the width with
          no empty bands; the approved desktop (>=1024px) keeps the square box. */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg bg-white dark:bg-background lg:aspect-square",
          !selected.url && "aspect-square"
        )}
      >
        {selected.url ? (
          <div
            ref={mainImageRef}
            className="relative w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
          >
            {/* The 1080×1080 props mirror the `c_limit` delivery box: a truthful
                placeholder ratio until the bytes arrive, then the image's own
                natural ratio takes over (attributes map to `aspect-ratio: auto …`). */}
            <Image
              src={displayImageUrl}
              alt={selectedAlt}
              width={1080}
              height={1080}
              sizes="(max-width: 1024px) 100vw, 640px"
              unoptimized
              className="block w-full h-auto object-contain lg:absolute lg:inset-0 lg:h-full lg:w-full"
              style={{ objectFit: 'contain' }}
              priority
            />
            {/* Lens overlay marking the exact magnified region */}
            {zoomFrame && (
              <div
                className="absolute pointer-events-none border border-primary/50 bg-primary/10 rounded-[2px]"
                style={{
                  left: zoomFrame.lensLeft,
                  top: zoomFrame.lensTop,
                  width: zoomFrame.lensWidth,
                  height: zoomFrame.lensHeight,
                  opacity: isZoomVisible ? 1 : 0,
                  transition: `opacity ${ZOOM_FADE_MS}ms ease-out`,
                }}
                aria-hidden="true"
              />
            )}
          </div>
        ) : (
          <ProductImagePlaceholder label="Photos coming soon" />
        )}
      </div>

      {/* Zoom panel — overlays the space to the right of the image (desktop only) */}
      {zoomFrame && (
        <div
          className="absolute z-40 pointer-events-none overflow-hidden rounded-lg bg-muted/40 shadow-xl"
          style={{
            left: zoomFrame.panelLeft,
            top: zoomFrame.panelTop,
            width: zoomFrame.panelWidth,
            height: zoomFrame.panelHeight,
            opacity: isZoomVisible ? 1 : 0,
            transition: `opacity ${ZOOM_FADE_MS}ms ease-out`,
          }}
          aria-hidden="true"
        >
          <Image
            src={zoomFrame.src}
            alt=""
            width={Math.max(1, Math.round(zoomFrame.imageWidth))}
            height={Math.max(1, Math.round(zoomFrame.imageHeight))}
            sizes="50vw"
            unoptimized
            loading="eager"
            className="absolute max-w-none"
            style={{
              left: zoomFrame.imageLeft,
              top: zoomFrame.imageTop,
              width: zoomFrame.imageWidth,
              height: zoomFrame.imageHeight,
            }}
          />
          {/* Outline drawn over the image so the magnified pixels can reach
              every edge of the panel (a real border would inset them by 1px). */}
          <div className="absolute inset-0 rounded-lg border border-border" />
        </div>
      )}

      {/* Thumbnails — horizontal scroll on mobile, vertical column on desktop */}
      {!hideThumbnails && (
        <ul
          className="order-first flex gap-2 overflow-x-auto pb-1 lg:order-none lg:col-start-2 lg:row-start-1 lg:flex-col lg:overflow-visible"
          aria-label="Product image gallery"
        >
          {images.map((image, index) => {
            const alt = image.alt ?? `${productName} image ${index + 1}`;
            const active = index === selectedIndex;
            return (
              <li key={image.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Show image ${index + 1} of ${images.length}: ${alt}`}
                  aria-pressed={active}
                  className={cn(
                    "relative block size-16 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-18 md:size-20 lg:size-full lg:aspect-square",
                    active
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-md">
                    <Image
                      src={productImageThumb(image.url, 200)}
                      alt=""
                      fill
                      sizes="80px"
                      unoptimized
                      priority={index === 0}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
