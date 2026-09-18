import { ImageResponse } from "next/og";
import { BrandImage, ogImageSize } from "@/lib/og-image";

export const alt = "Sanoori Trading";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<BrandImage />, {
    ...size,
  });
}