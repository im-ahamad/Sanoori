import { z } from "zod";

export const IMAGE_ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const IMAGE_MAX_SIZE_MB = Math.round(IMAGE_MAX_SIZE_BYTES / 1024 / 1024);
export const IMAGE_MAX_PER_PRODUCT = 6;
export const IMAGE_ALT_MAX_LENGTH = 200;

export const SIGN_UPLOAD_SCHEMA = z.object({
  productId: z.string().min(1),
  fileName: z.string().min(1).max(200),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(
      IMAGE_MAX_SIZE_BYTES,
      `Image must be smaller than ${IMAGE_MAX_SIZE_MB} MB`,
    ),
  fileType: z.enum(IMAGE_ACCEPTED_MIME, {
    message: "Only JPG, PNG, and WebP images are allowed",
  }),
});
export type SignUploadInput = z.infer<typeof SIGN_UPLOAD_SCHEMA>;

export const ATTACH_IMAGE_SCHEMA = z.object({
  productId: z.string().min(1),
  publicId: z.string().min(1),
});
export type AttachImageInput = z.infer<typeof ATTACH_IMAGE_SCHEMA>;

export const DELETE_IMAGE_SCHEMA = z.object({
  productId: z.string().min(1),
  imageId: z.string().min(1),
});
export type DeleteImageInput = z.infer<typeof DELETE_IMAGE_SCHEMA>;

export const REORDER_IMAGES_SCHEMA = z.object({
  productId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
});
export type ReorderImagesInput = z.infer<typeof REORDER_IMAGES_SCHEMA>;

export const UPDATE_IMAGE_ALT_SCHEMA = z.object({
  imageId: z.string().min(1),
  alt: z.string().max(IMAGE_ALT_MAX_LENGTH),
});
export type UpdateImageAltInput = z.infer<typeof UPDATE_IMAGE_ALT_SCHEMA>;