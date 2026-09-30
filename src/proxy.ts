import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge runtime — optimistic auth gate for /admin (defense in depth only).
 *
 * The real security boundary is the admin layout (src/app/admin/layout.tsx),
 * which validates the session again server-side on the Node.js runtime.
 * This proxy only upgrades UX: unauthenticated visitors are redirected to the
 * login page before the dashboard shell has a chance to render.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname === "/secure-admin") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    return res;
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/secure-admin", req.nextUrl.origin));
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  return res;
});

export const config = {
  matcher: ["/admin/:path*"],
};