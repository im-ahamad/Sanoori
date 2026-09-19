/**
 * Client-safe URL helpers for Cloudinary product images.
 *
 * Only plain string manipulation of delivery URLs — no secrets, no API calls,
 * safe to import from client components. The stored `url` is the untransformed
 * delivery URL (e.g. https://res.cloudinary.com/<cloud>/image/upload/<publicId>);
 * these helpers inject Cloudinary transformation parameters to serve exactly
 * the size/format needed by each surface.
 */
export function buildImageUrl(
  deliveryUrl: string,
  options?: { width?: number; height?: number; format?: "auto" | "webp" | "jpg" | "png"; quality?: "auto" | number }
): string {
  if (!deliveryUrl) return deliveryUrl;

  const parts: string[] = [];
  parts.push(options?.format === "auto" ? "f_auto" : options?.format ? `f_${options.format}` : "f_auto");
  parts.push(options?.quality === "auto" ? "q_auto" : options?.quality ? `q_${options.quality}` : "q_auto");
  if (options?.width) parts.push(`w_${options.width}`);
  if (options?.height) parts.push(`h_${options.height}`, "c_fill");

  const marker = "/image/upload/";
  const index = deliveryUrl.indexOf(marker);
  if (index === -1) return deliveryUrl;

  const head = deliveryUrl.slice(0, index + marker.length);
  const tail = deliveryUrl.slice(index + marker.length);
  return `${head}${parts.join(",")}/${tail}`;
}

export function productImageThumb(deliveryUrl: string, size = 160): string {
  return buildImageUrl(deliveryUrl, { width: size, height: size, format: "auto", quality: "auto" });
}

export function productImageHero(
  deliveryUrl: string,
  width = 1200,
  quality: "auto" | number = "auto"
): string {
  return buildImageUrl(deliveryUrl, { width, format: "auto", quality });
}