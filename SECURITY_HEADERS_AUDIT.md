# SECURITY HEADERS AUDIT RESULT

## Overall Status

NEEDS HARDENING

## Header Status

| Header                       | Current Status | Scope | Risk | Notes |
| ---------------------------- | -------------- | ----- | ---- | ----- |
| Content-Security-Policy      | Not configured | Both  | 🟡 MEDIUM | No CSP header present. Application uses inline scripts (theme, language init), Google Fonts, Cloudinary images, Google Maps embed, YouTube/TikTok embeds, JSON-LD scripts. A strict CSP would require careful allowlisting. |
| X-Frame-Options              | Not configured | Both  | 🟡 MEDIUM | No X-Frame-Options header. Admin and public pages can be framed. Clickjacking protection absent. |
| frame-ancestors              | Not configured | Both  | 🟡 MEDIUM | No CSP frame-ancestors directive (CSP absent). |
| Referrer-Policy              | Not configured | Both  | 🔵 LOW | No explicit Referrer-Policy. Browser default is `strict-origin-when-cross-origin` which is acceptable. |
| Permissions-Policy           | Not configured | Both  | 🔵 LOW | No Permissions-Policy. Features like camera, microphone, geolocation, payment, USB are available by default but not used by the application. |
| X-Content-Type-Options       | Not configured | Both  | 🔵 LOW | No `nosniff` header. Next.js serves correct Content-Type but defense-in-depth missing. |
| Strict-Transport-Security    | Not configured | Both  | 🟡 MEDIUM | No HSTS header. Application configured for HTTPS in production (siteConfig.url uses https://), but HSTS not enabled. Preload not configured. |
| Cross-Origin-Opener-Policy   | Not configured | Both  | 🟢 PASS | Not needed. No cross-origin opener isolation requirements. |
| Cross-Origin-Resource-Policy | Not configured | Both  | 🟢 PASS | Not needed. No cross-origin resource sharing requiring isolation. |
| Cross-Origin-Embedder-Policy | Not configured | Both  | 🟢 PASS | Not needed. Application embeds third-party resources (Google Maps, YouTube) which would break with COEP. |
| Cache-Control                | Partially configured | Both | 🟡 MEDIUM | `no-cache, must-revalidate` on all HTML responses (Next.js default for dynamic pages). Admin pages correctly use `force-dynamic`. Auth API uses `force-dynamic`. No explicit `private` or `no-store` on authenticated responses, but dynamic rendering prevents caching. |

## Findings

### Critical

None

### High

None

### Medium

**1. Missing Content-Security-Policy**
- **Current state**: No CSP header present on any response.
- **Evidence**: Verified via `curl -I` on `/`, `/products`, `/admin`, `/admin/login` — no CSP header returned.
- **Security impact**: Without CSP, the application has no defense against XSS via injected scripts, malicious inline scripts, or unauthorized external resources. However, Next.js 16 with React 19 uses nonces for some inline scripts, and the application uses server components heavily which reduces XSS surface.
- **Type**: Hardening opportunity (not a vulnerability — no evidence of exploitable XSS).
- **Scope**: Both public and admin pages.
- **Recommended action**: Implement CSP in a controlled step. Must allow: `script-src 'self' 'nonce-*'` (Next.js nonces), `style-src 'self' 'unsafe-inline'` (Tailwind/inline styles), `img-src 'self' data: https://res.cloudinary.com`, `font-src 'self' data: https://fonts.gstatic.com`, `frame-src https://www.google.com https://www.youtube.com https://www.tiktok.com`, `connect-src 'self' https://api.cloudinary.com`. Test thoroughly in staging before production.

**2. Missing X-Frame-Options / frame-ancestors**
- **Current state**: No X-Frame-Options header, no CSP frame-ancestors.
- **Evidence**: Response headers show no framing protection.
- **Security impact**: Admin pages and public pages can be embedded in iframes on attacker-controlled sites, enabling clickjacking attacks. Admin login page is particularly sensitive.
- **Type**: Hardening opportunity.
- **Scope**: Both public and admin pages (admin higher priority).
- **Recommended action**: Add `X-Frame-Options: DENY` for admin routes (`/admin/*`) and `SAMEORIGIN` for public pages, or use CSP `frame-ancestors 'none'` for admin and `'self'` for public when CSP is implemented.

**3. Missing Strict-Transport-Security (HSTS)**
- **Current state**: No HSTS header.
- **Evidence**: Response headers show no HSTS. `.env` has `AUTH_TRUST_HOST=true` indicating proxy deployment. `siteConfig.url` uses `https://sanooritrading.com`.
- **Security impact**: Without HSTS, initial HTTP requests (if any) or SSL stripping attacks could downgrade connections. Production deployment appears to intend HTTPS.
- **Type**: Hardening opportunity (requires verified HTTPS production deployment).
- **Scope**: Both public and admin pages.
- **Recommended action**: Enable HSTS only after confirming production HTTPS termination (Vercel, Nginx, Cloudflare, etc.). Recommended: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` after testing. Do not enable in development.

### Low

**4. Missing X-Content-Type-Options: nosniff**
- **Current state**: Not present.
- **Evidence**: Response headers lack this header.
- **Security impact**: Minor. Prevents MIME sniffing in older browsers. Next.js sets correct Content-Type headers.
- **Type**: Hardening opportunity.
- **Scope**: Both.
- **Recommended action**: Add `X-Content-Type-Options: nosniff` globally.

**5. Missing Referrer-Policy**
- **Current state**: Not explicitly set.
- **Evidence**: No Referrer-Policy header.
- **Security impact**: Low. Browser default (`strict-origin-when-cross-origin`) is reasonable. No sensitive data in URLs observed.
- **Type**: Minor improvement.
- **Scope**: Both.
- **Recommended action**: Consider explicit `Referrer-Policy: strict-origin-when-cross-origin` for clarity.

**6. Missing Permissions-Policy**
- **Current state**: Not configured.
- **Evidence**: No Permissions-Policy header.
- **Security impact**: Low. Application does not use camera, microphone, geolocation, payment, USB, or fullscreen APIs. Default browser behavior allows these if not restricted.
- **Type**: Minor improvement.
- **Scope**: Both.
- **Recommended action**: Consider `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)` to explicitly disable unused features.

**7. X-Powered-By header exposed**
- **Current state**: `X-Powered-By: Next.js` present on all responses.
- **Evidence**: Observed in all `curl -I` responses.
- **Security impact**: Low. Information disclosure only — reveals framework version.
- **Type**: Minor improvement.
- **Scope**: Both.
- **Recommended action**: Disable in `next.config.ts` with `poweredByHeader: false`.

### Existing Protections

1. **Auth.js Session Cookies** — HttpOnly, SameSite=Lax, secure in production (AUTH_TRUST_HOST enables Secure behind proxy). CSRF token cookie also HttpOnly.
2. **Admin Authentication** — Dual-layer: edge middleware (proxy.ts) + server-side layout validation (AdminLayout). Session validated on Node.js runtime per request.
3. **Admin Robots Meta** — `noindex, nofollow` on all `/admin/*` pages via layout metadata.
4. **Dynamic Rendering** — Admin pages and auth routes use `dynamic = "force-dynamic"` preventing Next.js Data Cache from storing authenticated responses.
5. **Next.js Default Cache-Control** — `no-cache, must-revalidate` on dynamic HTML responses.
6. **External Image Domain Allowlist** — `next.config.ts` restricts `next/image` to `res.cloudinary.com` only.
7. **Server-Only Cloudinary Config** — API secret never exposed to client; signed uploads only.
8. **Auth.js JWT Sessions** — Stateless, signed, encrypted cookies; no server-side session store to leak.
9. **Password Hashing** — bcryptjs with cost factor (default 10) for admin credentials.
10. **Role-Based Access** — Admin role checked in both proxy and layout (`session.user.role !== "ADMIN"`).

## Application Compatibility Considerations

Before implementing CSP or restrictive headers, the following third-party resources **must** be allowed:

| Resource | Domain | Directive(s) Required |
|----------|--------|----------------------|
| Cloudinary Images | `res.cloudinary.com` | `img-src`, `connect-src` (for signed uploads to `api.cloudinary.com`) |
| Google Fonts (Inter, DM_Sans) | `fonts.googleapis.com`, `fonts.gstatic.com` | `style-src`, `font-src` |
| Google Maps Embed | `www.google.com` | `frame-src` |
| YouTube Embed | `www.youtube.com`, `youtube.com` | `frame-src` |
| TikTok Embed | `www.tiktok.com` | `frame-src` |
| WhatsApp Links | `wa.me`, `web.whatsapp.com`, `api.whatsapp.com` | `connect-src` (if any fetch), otherwise just anchor navigation |
| Social Media Links | `facebook.com`, `instagram.com`, `telegram.org`, `tiktok.com`, `youtube.com` | Anchor navigation only; no embeds detected |
| Next.js Nonces | `'self'` | `script-src 'nonce-*'` (auto-generated by Next.js) |
| Inline Theme/Lang Scripts | Inline in `<head>` | `script-src 'unsafe-inline'` OR refactor to external files with nonces |
| JSON-LD Schema Scripts | Inline `<script type="application/ld+json">` | `script-src 'unsafe-inline'` OR move to external JSON endpoint |

**Critical CSP blockers:**
- `themeScript` and language init script in `head-scripts.tsx` use `dangerouslySetInnerHTML` — require `'unsafe-inline'` or nonce refactor.
- JSON-LD scripts in `/about`, `/products`, `/products/[slug]` use inline `<script type="application/ld+json">`.
- Tailwind CSS generates inline styles — requires `style-src 'unsafe-inline'`.
- Next.js 16 uses nonces for some inline scripts but not all.

## Admin-Specific Findings

| Page | Current Headers | Framing Risk | Caching Risk | Notes |
|------|----------------|--------------|--------------|-------|
| `/admin` | 307 → `/admin/login`, sets auth cookies | Can be framed (no XFO) | Dynamic (`force-dynamic`) prevents caching | Redirects unauthenticated users |
| `/admin/login` | 200, sets CSRF + callback cookies (HttpOnly, SameSite=Lax) | Can be framed | Dynamic (`force-dynamic`) | No HSTS, no CSP, no XFO |
| `/admin/*` (authenticated) | 200, dynamic rendering | Can be framed | Dynamic (`force-dynamic`) + Auth.js session | Server-side role check in layout |
| Auth API (`/api/auth/*`) | 400/200, dynamic | N/A (API) | `force-dynamic` | No caching |

**Admin-specific gaps:**
1. No `X-Frame-Options: DENY` on `/admin/*` — clickjacking risk on login and dashboard.
2. No `Cache-Control: private, no-store` explicitly on authenticated responses (though dynamic rendering mitigates).
3. No HSTS — admin should enforce HTTPS strictly.
4. Auth cookies lack `Secure` flag in development (expected); will be set in production via `AUTH_TRUST_HOST=true`.

## Recommended Next Step

**HARDENING RECOMMENDED — Implement in controlled separate step:**

1. **Disable `X-Powered-By`** — Add `poweredByHeader: false` to `next.config.ts` (low risk, immediate).
2. **Add `X-Content-Type-Options: nosniff`** globally (low risk).
3. **Add `X-Frame-Options` per route**:
   - `DENY` for `/admin/*` via middleware or headers config.
   - `SAMEORIGIN` for public pages.
4. **Add `Referrer-Policy: strict-origin-when-cross-origin`** globally.
5. **Add `Permissions-Policy`** disabling unused features.
6. **Implement CSP** — **Requires careful staging testing**. Start with report-only:
   ```
   Content-Security-Policy-Report-Only: 
     default-src 'self';
     script-src 'self' 'nonce-*' 'unsafe-inline';
     style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
     img-src 'self' data: https://res.cloudinary.com;
     font-src 'self' data: https://fonts.gstatic.com;
     frame-src https://www.google.com https://www.youtube.com https://www.tiktok.com;
     connect-src 'self' https://api.cloudinary.com;
     frame-ancestors 'none';
     base-uri 'self';
     form-action 'self';
   ```
   - Monitor reports, adjust, then enforce.
   - Consider moving inline scripts (theme, language, JSON-LD) to external files or nonce-compatible patterns.
7. **Enable HSTS** — Only after production HTTPS verified. Add via platform (Vercel/Nginx/Cloudflare) not Next.js config.

## Files Inspected

1. `next.config.ts` — Image domain config only, no headers config
2. `src/proxy.ts` — Auth.js edge middleware for `/admin/*`, no headers
3. `src/app/layout.tsx` — Root layout, fonts, head scripts, providers
4. `src/app/admin/layout.tsx` — Admin root layout, robots noindex
5. `src/app/admin/(admin)/layout.tsx` — Authenticated admin layout, `force-dynamic`, server-side auth check
6. `src/app/admin/(auth)/login/page.tsx` — Admin login page, `force-dynamic`
7. `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route, `force-dynamic`
8. `src/lib/auth.config.ts` — Auth.js edge config, JWT sessions
9. `src/lib/auth.ts` — Auth.js Node.js config, Credentials provider
10. `src/components/scripts/head-scripts.tsx` — Inline theme + language scripts
11. `src/components/theme/theme-script.tsx` — Inline theme initialization script
12. `src/config/site.ts` — Business config with external URLs (Cloudinary, Google Maps, YouTube, TikTok, social)
13. `src/lib/cloudinary.ts` — Server-only Cloudinary config, signed uploads
14. `src/lib/cloudinary-url.ts` — Client-safe Cloudinary URL helpers
15. `src/app/contact/contact-content.tsx` — Contact page (no Maps embed found in current code)
16. `src/app/about/page.tsx` — About page with JSON-LD schema script
17. `src/app/products/page.tsx` — Products page with JSON-LD breadcrumb script
18. `src/app/request-quote/page.tsx` — Request quote page
19. `src/components/home/hero.tsx` — Hero with local image
20. `src/components/layout/header.tsx` — Header with social links, WhatsApp
21. `src/components/layout/footer.tsx` — Footer with social links, WhatsApp
22. `.env` — Environment config (AUTH_TRUST_HOST, HTTPS production intent)
23. `package.json` — Dependencies (Next.js 16.3.5, next-auth v5 beta, React 19)
24. Live dev server responses — `curl -I` on `/`, `/products`, `/admin`, `/admin/login`, `/api/auth/signin`, `/about`