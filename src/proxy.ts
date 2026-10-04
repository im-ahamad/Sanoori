import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge runtime — security headers only.
 *
 * Sets X-Frame-Options per route:
 * - DENY for /admin/* and /secure-admin
 * - SAMEORIGIN for public routes
 *
 * Auth checks and redirects are handled by the admin layout (server-side)
 * and /secure-admin page — this middleware is defense in depth for headers only.
 */
const { auth } = NextAuth(authConfig);

function isAdminRoute(pathname: string): boolean {
  return pathname === "/secure-admin" || pathname.startsWith("/admin/");
}

const adminFrameOptions = { "X-Frame-Options": "DENY" };
const publicFrameOptions = { "X-Frame-Options": "SAMEORIGIN" };

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdmin = isAdminRoute(pathname);

  // Only set security headers — auth/redirects handled by pages/layout
  if (isAdmin) {
    return NextResponse.next({ headers: { "X-Frame-Options": "DENY" } });
  }

  // Public routes — allow same-origin framing
  return NextResponse.next({ headers: { "X-Frame-Options": "SAMEORIGIN" } });
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (static files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};