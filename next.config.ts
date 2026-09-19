import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        // Pattern matches https://res.cloudinary.com/<cloud-name>/image/upload/**.
        // Cloudinary URLs are already transformed with f_auto/q_auto/resizing on
        // delivery, so these are rendered with the `unoptimized` Image flag.
        pathname: "/*/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
