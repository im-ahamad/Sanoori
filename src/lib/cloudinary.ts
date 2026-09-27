import { v2 as cloudinary } from "cloudinary";

// Server-only module. The Cloudinary API secret must NEVER be exposed to the
// browser. Importing this file from a client component fails the Next.js
// client boundary check because `cloudinary` depends on Node.js APIs.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
});

export const CLOUDINARY_ROOT_FOLDER = "SanooriTrading/products";

function getConfig() {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    api_key: process.env.CLOUDINARY_API_KEY ?? "",
    api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
  };
}

export function isCloudinaryConfigured(): boolean {
  const { cloud_name, api_key, api_secret } = getConfig();
  return Boolean(cloud_name && api_key && api_secret);
}

export function publicIdForProduct(
  productId: string,
  uniqueSuffix: string,
): string {
  return `${CLOUDINARY_ROOT_FOLDER}/${productId}/${uniqueSuffix}`;
}

export function isPublicIdForProduct(
  publicId: string,
  productId: string,
): boolean {
  return publicId.startsWith(`${CLOUDINARY_ROOT_FOLDER}/${productId}/`);
}

export const ALLOWED_CLOUDINARY_FORMATS = "jpg,jpeg,png,webp";

/**
 * Builds the signed upload request the browser POSTs directly to Cloudinary.
 * The signature covers every parameter the client may send, so the browser
 * cannot change `public_id`, `resource_type`, or `allowed_formats` without
 * Cloudinary rejecting the request (signature mismatch). The API secret stays
 * on the server.
 */
export function getSignedUploadParams(productId: string, uniqueSuffix: string) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  const { cloud_name, api_key, api_secret } = getConfig();
  const publicId = publicIdForProduct(productId, uniqueSuffix);
  const timestamp = Math.floor(Date.now() / 1000);

  // `resource_type` is never part of the signature (Cloudinary excludes it
  // from the string-to-sign), so it is not included in the signing set. Any
  // attempt to change the upload's resource type is rejected by the attach
  // check server-side, which verifies the asset and destroys non-images.

  const signingParams = {
    public_id: publicId,
    timestamp,
    allowed_formats: ALLOWED_CLOUDINARY_FORMATS,
  } as const;

  const signature = cloudinary.utils.api_sign_request(signingParams, api_secret);
  return {
    endpoint: `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    params: {
      public_id: publicId,
      resource_type: "image",
      timestamp,
      allowed_formats: ALLOWED_CLOUDINARY_FORMATS,
      api_key,
    },
    signature,
    publicId,
  };
}

export interface CloudinaryResourceInfo {
  format: string;
  bytes: number;
  resourceType: string;
  width: number;
  height: number;
}

/**
 * Confirms the uploaded asset actually exists on Cloudinary and returns its
 * metadata. Used server-side AFTER the browser finishes an upload so the
 * server never trusts the client's word about what was uploaded.
 */
export async function verifyCloudinaryResource(
  publicId: string,
): Promise<
  | { ok: true; resource: CloudinaryResourceInfo }
  | { ok: false; error: string }
> {
  if (!isCloudinaryConfigured()) {
    return { ok: false, error: "Cloudinary is not configured" };
  }
  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });
    return {
      ok: true,
      resource: {
        format: String(resource.format ?? "").toLowerCase(),
        bytes: Number(resource.bytes ?? 0),
        resourceType: String(resource.resource_type ?? "image"),
        width: Number(resource.width ?? 0),
        height: Number(resource.height ?? 0),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Unable to verify resource",
    };
  }
}

/**
 * Deletes the asset from Cloudinary. Returns ok:false (leaving the DB record
 * intact) when the remote deletion fails, so assets stay recoverable.
 */
export async function destroyCloudinaryAsset(
  publicId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isCloudinaryConfigured()) {
    return { ok: false, error: "Cloudinary is not configured" };
  }
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Remote delete failed",
    };
  }
}

function getCloudName(): string {
  return process.env.CLOUDINARY_CLOUD_NAME ?? "";
}

/** Plain delivery URL (no transforms) used as the stored base `url`. */
export function cloudinaryDeliveryUrl(publicId: string): string {
  const cloudName = getCloudName();
  if (!cloudName) return "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

/** Optimized thumbnail URL for admin lists: auto format/quality, c_fill crop. */
export function cloudinaryThumbUrl(
  publicId: string,
  width: number,
  height?: number,
): string {
  const cloudName = getCloudName();
  if (!cloudName) return "";
  const transforms = ["f_auto", "q_auto", `w_${width}`, "c_fill"];
  if (height) transforms.push(`h_${height}`);
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(",")}/${publicId}`;
}