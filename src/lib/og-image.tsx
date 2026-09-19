import { readFileSync } from "node:fs";
import { join } from "node:path";
import { siteConfig, businessConfig } from "@/config/site";

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

function logoDataUrl(): string {
  const filePath = join(process.cwd(), "public", businessConfig.logo.src);
  const buffer = readFileSync(filePath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export function BrandImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#1d2a4f",
        color: "#ffffff",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 12,
          background: "#d9a22b",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoDataUrl()}
        alt=""
        width={120}
        height={120}
        style={{
          objectFit: "contain",
          borderRadius: 16,
          marginBottom: 32,
        }}
      />
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        {siteConfig.name}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 32,
          color: "#d9a22b",
          fontWeight: 600,
        }}
      >
        {siteConfig.tagline}
      </div>
    </div>
  );
}