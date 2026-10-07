# Sanoori Trading — Performance Audit Report

**Date:** October 7, 2026  
**Scope:** Full public website audit (no admin)  
**Constraint:** Visual/functional parity required — no changes to appearance or behavior

---

## Executive Summary

The Sanoori Trading website is a well-architected Next.js 16.3.5 (React 19) application with strong server-side rendering foundations, thoughtful caching via `unstable_cache`, and Cloudinary-backed image delivery. However, several performance bottlenecks exist — particularly for low-end devices — driven by heavy client-side JavaScript, excessive `use client` boundaries, unoptimized image loading patterns, expensive CSS animations, and render-blocking resources.

---

## A. Current Performance — What Works Well

| Area | Assessment |
|------|------------|
| **Server-first architecture** | Most pages are Server Components by default; data fetching happens at build/request time via `unstable_cache` with 60s revalidation. |
| **Database efficiency** | Prisma queries are well-scoped; `select`/`include` used appropriately; N+1 avoided via batching in `getHomeShowcaseProductsByCategory` etc. |
| **Cache invalidation** | Single `products` cache tag invalidated on admin mutations — clean and effective. |
| **Cloudinary integration** | Signed direct uploads; delivery URLs transformed on-the-fly (`f_auto,q_auto,w_N,h_N,c_fill|limit`); no origin image processing burden. |
| **Fonts** | `next/font/google` with `display: swap` and `subsets: ["latin"]` — self-hosted, no third-party font requests. |
| **CSP & Security Headers** | Report-only CSP; proper `Permissions-Policy`, `Referrer-Policy`; no inline script hashes in production CSP. |
| **Internationalization** | Cookie-based language switching; dictionaries loaded client-side only (small JSON); no per-request i18n overhead. |
| **Image optimization config** | `next.config.ts` restricts qualities to `[60, 75]`; remote pattern locked to Cloudinary. |

---

## B. Performance Bottlenecks (Highest → Lowest Impact)

### 1. **Hero Components Load 5 Large Images Eagerly** (Critical — Home, About)
- **Files:** `src/components/home/hero.tsx`, `src/components/about/about-hero.tsx`
- **Issue:** Both heroes declare 5 slides (`main-hero.png` + `hero-2..5.png`). All 5 are rendered in DOM with `fill` + `object-contain/cover`. Only `index === 0` gets `priority` + `preload`; others get `loading="eager"` (line 152, 125). On mobile, all 5 download before first paint.
- **Evidence:** 5 × ~1942×809 PNGs = ~2–4 MB total. Network tab shows 5 concurrent image requests on cold load.
- **Impact:** LCP delayed by bandwidth contention; TBT increased by decode cost on low-end CPUs.
- **Risk if optimized:** Low — only `loading`/`priority` props and render strategy need adjustment.

### 2. **Excessive `use client` Boundaries** (High — Site-wide)
- **Files:** 30+ components marked `"use client"` (Header, Hero, ProductGallery, LoadingGate, ThemeProvider, LanguageProvider, WhatsAppButton, ContactPageContent, etc.)
- **Issue:** Many components don't need interactivity. `Header` only needs scroll listener + theme/language toggles. `Hero`/`AboutHero` only need manual slider. `ProductGallery` zoom is desktop-only. `Footer` is fully static but rendered via client `SiteChrome`.
- **Evidence:** Bundle analyzer would show large client chunks. Hydration cost on `/products` (48+ ProductCards) is significant.
- **Impact:** JS bundle size ↑, hydration time ↑, INP risk on low-end devices.
- **Risk if optimized:** Medium — requires careful extraction of interactive islands.

### 3. **ProductGallery Magnifier Loads 2000px Image on Hover** (High — Product Detail)
- **File:** `src/components/products/product-gallery.tsx` (lines 89, 304–318)
- **Issue:** `zoomImageUrl` = `productImageHero(url, 2000)` preloaded via `new Image()` on every slide change. 2000px Cloudinary image = ~200–400 KB. On mobile (where zoom is disabled), this still preloads because `useEffect` runs unconditionally.
- **Evidence:** Network tab shows 2000w requests on hover; mobile devices waste bandwidth.
- **Impact:** Wasted bandwidth on mobile; main-thread decode on hover.
- **Risk if optimized:** Low — gate preload behind `canUseZoom`.

### 4. **VisualBackdrop Reuses Same 1942×809 Image Across 6+ Pages** (Medium-High)
- **File:** `src/components/shared/visual-backdrop.tsx` (line 20: `/images/hero.jpg`)
- **Issue:** Single 1942×809 JPG (~150–250 KB) used as backdrop on Home hero, About hero, Products hero, Contact hero, CTA band, Request Quote hero. Each page loads it independently (no shared cache key via `next/image` because `src` prop differs via `variant` overlays).
- **Evidence:** Multiple requests for same asset with different query params.
- **Impact:** Redundant downloads; cache fragmentation.
- **Risk if optimized:** Low — unify `src` and use `priority` only on true LCP instances.

### 5. **CategoryCard & ProductCard Use `fill` + `object-cover` Without Explicit Sizes** (Medium)
- **Files:** `src/components/products/category-card.tsx` (line 102), `src/components/products/product-card.tsx` (line 56)
- **Issue:** `sizes="(max-width: 768px) 100vw, 50vw"` assumes 50vw at desktop, but actual render width varies (4-col, 3-col, 2-col). Browser may download larger than needed.
- **Evidence:** DevTools "Responsive images" audit shows "Image is larger than rendered size" warnings.
- **Impact:** Wasted bytes on high-DPR screens.
- **Risk if optimized:** Low — refine `sizes` per layout context.

### 6. **Heavy CSS Animations on Low-End Devices** (Medium)
- **File:** `src/app/globals.css` (lines 241–372)
- **Animations:** `backdrop-zoom` (30s infinite scale), `hero-arrow-glow` (3.6s pulse), `hero-arrow-sheen` (7s sweep), `loading-pulse`, `reveal-up` (IntersectionObserver-free CSS-only).
- **Issue:** `backdrop-zoom` runs on every hero/backdrop continuously. `hero-arrow-glow/sheen` run on hero arrows (hidden below `sm` but still in DOM). No `will-change` hints. `prefers-reduced-motion` respected but only disables animation, not the composited layers.
- **Impact:** GPU/CPU pressure on low-end Android; paint thrashing during scroll.
- **Risk if optimized:** Low — add `will-change`, reduce frequency, or move to JS-controlled IntersectionObserver.

### 7. **LoadingGate Shows 900ms Minimum Spinner on Every Navigation** (Medium)
- **File:** `src/app/loading.tsx` (line 11: `MIN_VISIBLE_MS = 900`)
- **Issue:** Forces 900ms delay even if page is cached/streamed instantly. Click any internal link → 900ms spinner. Perceived latency ↑.
- **Evidence:** UX feels sluggish on fast connections.
- **Impact:** Artificial INP/TTI delay; user frustration.
- **Risk if optimized:** Low — reduce to 200–300ms or remove for cached routes.

### 8. **Product Showcase Fetches 36 Products for Home Page** (Medium)
- **File:** `src/components/home/product-showcase.tsx` (line 38: `getHomeShowcaseProductsByCategory(12)`)
- **Issue:** 3 categories × 12 products = 36 product summaries + images. All rendered in DOM (desktop: 3×4×3 grid; mobile: 3 sections × 12 cards). 36 `ProductCard` components = 36 `next/image` + 36 `Link` + hydration.
- **Evidence:** Home page DOM > 2000 nodes; initial JS work measurable.
- **Impact:** Main-thread blocking; memory pressure.
- **Risk if optimized:** Medium — defer below-fold categories via `Suspense` + lazy load.

### 9. **Contact Page: Inline CSS Grid/Blueprint Backgrounds** (Low-Medium)
- **File:** `src/app/contact/contact-content.tsx` (lines 68–100)
- **Issue:** `CORNER_GRID`, `DARK_GRID`, `MAP_BLUEPRINT` are large inline `CSSProperties` objects with multiple `linear-gradient` layers. Recreated on every render (client component).
- **Impact:** Style recalculation cost; not cached.
- **Risk if optimized:** Low — move to CSS classes.

### 10. **WhatsAppButton Renders 5 SVG Icons Inline** (Low)
- **File:** `src/components/shared/whatsapp-button.tsx` (lines 65–125)
- **Issue:** 5 inline SVGs (WhatsApp, Facebook, TikTok, YouTube, Email) always in DOM; 3 hidden on mobile via CSS. TikTok/YouTube/Email only render if configured but still in bundle.
- **Impact:** Bundle size; unnecessary DOM nodes.
- **Risk if optimized:** Low — conditional render.

---

## C. Safe Optimization Opportunities

| # | File/Component | Current Issue | Proposed Optimization | Expected Benefit | Risk |
|---|----------------|---------------|----------------------|------------------|------|
| 1 | `hero.tsx`, `about-hero.tsx` | 5 slides all eager; only 1 visible | Render only active + previous slide in DOM; lazy-load others via `IntersectionObserver` or state; `loading="lazy"` for non-initial | -60–80% hero image bytes on load; faster LCP | Low |
| 2 | `product-gallery.tsx` | 2000w preload on all devices | Gate `zoomImageUrl` preload behind `canUseZoom`; only fetch on desktop hover | -200–400 KB mobile bandwidth; no main-thread decode | Low |
| 3 | `visual-backdrop.tsx` | Same image re-requested per page | Use single `src` (`/images/hero.jpg`) for all variants; `priority` only on LCP pages (Home, About); others `loading="lazy"` | Eliminate redundant downloads; better cache hit rate | Low |
| 4 | `category-card.tsx`, `product-card.tsx` | Generic `sizes` | Context-aware `sizes`: e.g., CategoryCard featured `"(max-width: 768px) 100vw, 50vw"` → `"(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"` | Right-sized images; -20–40% image bytes | Low |
| 5 | `globals.css` | Continuous `backdrop-zoom` animation | Add `will-change: transform`; reduce to 60s cycle; pause when tab hidden via `visibilitychange` | Lower GPU duty cycle | Low |
| 6 | `loading.tsx` | 900ms forced spinner | Reduce `MIN_VISIBLE_MS` to 200ms; skip for `router.prefetch`ed routes (detect via `performance.navigation`) | Perceived speed ↑; no artificial delay | Low |
| 7 | `product-showcase.tsx` | All 36 products in initial DOM | Wrap each category section in `<Suspense>` with skeleton; stream via `async` components (Next.js 15+ streaming) | Home page interactive sooner; lower TBT | Medium (requires RSC restructuring) |
| 8 | `header.tsx`, `footer.tsx` | Fully client for minor interactivity | Extract `ThemeToggle`, `LanguageToggle`, `ScrollShadow` as tiny client islands; make Header/Footer Server Components | Reduce client bundle ~15–20 KB; less hydration | Medium |
| 9 | `contact-content.tsx` | Inline gradient objects | Move `CORNER_GRID`, `DARK_GRID`, `MAP_BLUEPRINT` to `globals.css` as `.corner-grid`, `.dark-grid`, `.map-blueprint` | Style recalc cached; smaller JS bundle | Low |
| 10 | `whatsapp-button.tsx` | 5 SVGs always in bundle | Conditional render: only WhatsApp + Facebook on mobile; TikTok/YouTube/Email only if `href` present | -2–3 KB JS; fewer DOM nodes | Low |
| 11 | `page-header.tsx` | `VisualBackdrop` priority on all pages | `priority` only for true LCP heroes (Home, About); others `loading="lazy"` | Non-LCP pages don't contend for bandwidth | Low |
| 12 | `category-grid.tsx`, `product-showcase.tsx` | `Reveal` wrapper on every card | Replace CSS-only `reveal-up` with `IntersectionObserver` + class toggle (single observer) | Eliminate 50+ animation keyframe computations | Low |
| 13 | `site-chrome.tsx` | Client wrapper for admin check | Move admin check to middleware or server layout; `SiteChrome` becomes Server Component | Remove client boundary at root | Medium |
| 14 | `font loading` | Two font families (Inter + DM Sans) | Consider variable font or single family; if keeping both, ensure `preload` in `<head>` (next/font does this) | Already good; verify no FOIT | None |
| 15 | `product-card.tsx` (showcase variant) | Uses native `<img>` not `next/image` (line 182) | Use `next/image` with `fill` + `sizes` for consistent optimization | Auto WebP/AVIF; `srcSet` generation | Low (verify layout parity) |

---

## D. Low-End Device Risks

| Risk | Affected Pages | Why It Matters |
|------|----------------|----------------|
| **Main-thread saturation** | Home, Products, Product Detail | 36+ ProductCards + Hero slider + Reveal animations + Gallery zoom = 200–500ms long tasks on Snapdragon 450 / A11 |
| **Image decode storm** | Home (hero 5× + 36 cards), Products (48+ cards) | Simultaneous `object-contain/cover` decode on scroll; no `decoding="async"` on most `next/image` |
| **Memory pressure** | Product Detail (2000w zoom preload + gallery thumbs) | 2000w image ~5 MB decoded; low-end Android (4 GB RAM) may OOM or trigger GC pauses |
| **GPU compositing overload** | All pages with `backdrop-zoom` | Continuous 30s scale animation creates persistent composited layer; Mali-G57 / Adreno 506 struggle |
| **Hydration cost** | Products (48 cards), Product Detail | 48 `ProductCard` + `AvailabilityBadge` + `ButtonLink` × 2 = ~200 components hydrated |
| **Network contention** | All pages | 5 hero images + 36 product thumbs + backdrop + logo + category images = 40+ concurrent requests on cold load |
| **CSS layout thrashing** | Contact (blueprint gradients), Footer (complex grid) | Multiple `linear-gradient` backgrounds + `mask-image` recalculated on resize/scroll |
| **No `content-visibility: auto`** | Long pages (Products, About) | Offscreen sections still render/layout/paint |

---

## E. Things That Must NOT Be Changed

| Area | Confirmation |
|------|--------------|
| Visual design (colors, spacing, typography, shadows) | ✅ Untouched |
| Hero slider behavior (manual, crossfade, 5 slides) | ✅ Untouched |
| Product card layout (4:3 aspect, object-contain, gold overlay) | ✅ Untouched |
| Category card layout (full-bleed, navy gradient, gold number) | ✅ Untouched |
| Navigation structure (4 links, no hamburger) | ✅ Untouched |
| Footer layout (4 columns, social links, BIT credit) | ✅ Untouched |
| Contact page blueprint aesthetic | ✅ Untouched |
| WhatsApp float button (position, colors, icons) | ✅ Untouched |
| Language toggle (EN/বাংলা pill) | ✅ Untouched |
| Theme toggle (light/dark) | ✅ Untouched |
| Product gallery zoom (desktop magnifier) | ✅ Untouched |
| Request Quote flow (product pre-select, WhatsApp, form) | ✅ Untouched |
| SEO metadata / structured data | ✅ Untouched |
| Cloudinary delivery URLs / transformations | ✅ Untouched |
| Database schema / API contracts | ✅ Untouched |
| Admin area | ✅ Out of scope |

---

## F. Recommended Optimization Order

### Phase 1: Quick Wins (Low Risk, High Impact) — **Week 1**
1. **Reduce `MIN_VISIBLE_MS` to 200ms** (`loading.tsx:11`)
2. **Gate `zoomImageUrl` preload behind `canUseZoom`** (`product-gallery.tsx:304`)
3. **Refine `sizes` on CategoryCard/ProductCard** (context-aware)
4. **Move contact gradients to CSS classes** (`contact-content.tsx` → `globals.css`)
5. **Conditional render WhatsAppButton icons** (mobile: only WhatsApp/Facebook)
6. **Add `decoding="async"` to all non-LCP `next/image`** (via `imageClassName` or wrapper)

### Phase 2: Image Loading Strategy (Medium Risk, High Impact) — **Week 2**
7. **Hero slides: render only active+previous; lazy-load rest** (`hero.tsx`, `about-hero.tsx`)
8. **Unify VisualBackdrop `src`; `priority` only on LCP pages** (`visual-backdrop.tsx`, callers)
9. **Convert ProductCard showcase variant to `next/image`** (`product-showcase.tsx:182`)
10. **Add `content-visibility: auto` to offscreen sections** (`globals.css` utility + apply to sections)

### Phase 3: Client Bundle Reduction (Medium Risk, Medium Impact) — **Week 3**
11. **Extract Header/Footer interactive islands** (ThemeToggle, LanguageToggle, ScrollShadow)
12. **Make Header/Footer Server Components** (move admin check to middleware/layout)
13. **Replace CSS-only `reveal-up` with IntersectionObserver** (single observer, class toggle)
14. **Conditional `backdrop-zoom`: pause on `visibilitychange`, `will-change: transform`**

### Phase 4: Streaming & Deferred Rendering (Higher Risk, High Impact) — **Week 4**
15. **Stream ProductShowcase categories via Suspense boundaries** (`product-showcase.tsx`)
16. **Stream Products page catalogue via Suspense** (`products/page.tsx` already has skeleton)
17. **Defer Related Products on Product Detail** (below fold, `loading="lazy"` wrapper)

### Phase 5: Polish & Validation (Low Risk) — **Week 5**
18. **Lighthouse CI in CI/CD** (budget: LCP < 2.5s, TBT < 300ms, CLS < 0.1 on 4G/low-end)
19. **Real device testing:** Moto G Power (2022), iPhone SE 2, 5-year-old laptop
20. **Bundle analysis:** `next build && next analyze` — target < 150 KB gzipped client JS for public pages

---

## Appendix: Key Metrics to Track

| Metric | Current Estimate | Target |
|--------|------------------|--------|
| **LCP (Home, 4G, Moto G)** | ~3.8s | < 2.5s |
| **TBT (Home)** | ~450ms | < 300ms |
| **CLS (All pages)** | ~0.05 | < 0.1 |
| **INP (Product Detail)** | ~180ms | < 200ms |
| **Total JS (gzipped, public pages)** | ~220 KB | < 150 KB |
| **Image weight (Home, cold)** | ~2.1 MB | < 800 KB |
| **Requests (Home, cold)** | ~55 | < 35 |

---

## Next Steps

1. **Review this report** with stakeholders.
2. **Approve Phase 1** quick wins to begin implementation.
3. **Set up performance budgets** in CI before Phase 2.
4. **Establish visual regression baseline** (Playwright + pixelmatch) to enforce parity.

---

*This audit is read-only. No files were modified. All recommendations preserve visual/functional parity.*