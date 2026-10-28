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
  options?: {
    width?: number;
    height?: number;
    format?: "auto" | "webp" | "jpg" | "png";
    quality?: "auto" | number;
    crop?: "c_fill" | "c_limit";
  }
): string {
  if (!deliveryUrl) return deliveryUrl;

  const parts: string[] = [];
  parts.push(
    options?.format === "auto"
      ? "f_auto"
      : options?.format
      ? `f_${options.format}`
      : "f_auto"
  );
  parts.push(
    options?.quality === "auto"
      ? "q_auto"
      : options?.quality
      ? `q_${options.quality}`
      : "q_auto"
  );
  if (options?.width) parts.push(`w_${options.width}`);
  if (options?.height) parts.push(`h_${options.height}`, options?.crop ?? "c_fill");

  const marker = "/image/upload/";
  const index = deliveryUrl.indexOf(marker);
  if (index === -1) return deliveryUrl;

  const head = deliveryUrl.slice(0, index + marker.length);
  let tail = deliveryUrl.slice(index + marker.length);

  // If the tail already contains a nested Cloudinary delivery URL (e.g. from a
  // buggy double-transformation), extract the inner publicId to avoid nesting.
  const nestedMarker = "https://res.cloudinary.com/";
  const nestedIndex = tail.indexOf(nestedMarker);
  if (nestedIndex !== -1) {
    const nestedUploadIndex = tail.indexOf("/image/upload/", nestedIndex);
    if (nestedUploadIndex !== -1) {
      tail = tail.slice(nestedUploadIndex + "/image/upload/".length);
    }
  }

  // Extract the publicId from the tail, handling any existing transformations.
  // Cloudinary URL format after /image/upload/ is either:
  //   <transformations>/<publicId>   (transformations are comma-separated params)
  //   <publicId>                     (no transformations)
  // The publicId may contain slashes. Transformations are comma-separated
  // parameters like w_640,h_480,c_fill,f_auto,q_auto.
  const slashIndex = tail.indexOf("/");
  let publicId = tail;

  if (slashIndex !== -1) {
    const potentialTransforms = tail.slice(0, slashIndex);
    // Heuristic: the segment before the first slash is transformations if it
    // consists of comma-separated params matching Cloudinary transformation
    // patterns (e.g., w_640, h_480, c_fill, f_auto, q_auto, fl_sanitize).
    // Avoid misclassifying public-ID folders like banner_images/ as transforms.
    const transformParams = potentialTransforms.split(",");
    const isTransforms = transformParams.every((param) =>
      /^(w_\d+|h_\d+|x_\d+|y_\d+|ar_\d+:\d+|g_\w+|dpr_\d*\.?\d+|e_\w+|bo_\d+px_solid_\w+|c_fill|c_limit|c_scale|c_crop|c_thumb|c_pad|c_lfill|c_mpad|c_fill_pad|f_auto|f_jpg|f_png|f_webp|q_auto|q_\d+|fl_sanitize|fl_attachment|fl_lossy|o_\w+|a_\d+|l_\w+(?::\w+)*|r_\d+|z_\d+)$/.test(
        param
      )
    );

    if (isTransforms) {
      // Existing transformations found; publicId is everything after the first slash.
      publicId = tail.slice(slashIndex + 1);
    }
    // else: no transformations; the entire tail is the publicId (may contain slashes).
  }
  // else: no slash; the entire tail is the publicId.

  return `${head}${parts.join(",")}/${publicId}`;
}

export function productImageThumb(deliveryUrl: string, size = 160): string {
  return buildImageUrl(deliveryUrl, {
    width: size,
    height: size,
    format: "auto",
    quality: "auto",
  });
}

export function productImageHero(
  deliveryUrl: string,
  width = 1200,
  quality: "auto" | number = "auto"
): string {
  return buildImageUrl(deliveryUrl, {
    width,
    height: width,
    crop: "c_limit",
    format: "auto",
    quality,
  });
}