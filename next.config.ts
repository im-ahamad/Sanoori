import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/*/image/upload/**",
      },
    ],
  },
  async headers() {
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'sha256-0245de03e69e791bddad34fae24733f02179e87cf815f0e2f3b2c94948ebfadb' 'sha256-3c21a8a1ff22517f6f21e135c865aec82ef928a66e99e038a244f66d69cd54b0'",
      "style-src 'self'",
      "img-src 'self' data: https://res.cloudinary.com",
      "font-src 'self'",
      "connect-src 'self' https://api.cloudinary.com",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      // All routes — security headers except X-Frame-Options (set by middleware per-route)
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
        ],
      },
    ];
  },
};

export default nextConfig;
