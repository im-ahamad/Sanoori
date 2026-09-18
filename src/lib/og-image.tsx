import { siteConfig } from "@/config/site";

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 96,
          height: 96,
          borderRadius: 16,
          background: "#d9a22b",
          color: "#1d2a4f",
          fontSize: 40,
          fontWeight: 800,
          marginBottom: 32,
        }}
      >
        ST
      </div>
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