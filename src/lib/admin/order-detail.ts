import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { InquiryStatus, InquirySource } from "@/generated/prisma/enums";
import {
  isInquirySource,
  isInquiryStatus,
} from "@/lib/inquiries";

function isUsableImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export interface AdminOrderDetailProduct {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  isActive: boolean;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface AdminOrderDetail {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  productId: string | null;
  quantity: number | null;
  message: string;
  source: InquirySource;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  product: AdminOrderDetailProduct | null;
}

export type AdminOrderDetailResult =
  | { ok: true; data: AdminOrderDetail }
  | { ok: false; error: "database" | "not-found" };

export async function getAdminOrderDetail(
  id: string
): Promise<AdminOrderDetailResult> {
  try {
    const raw = await db.inquiry.findUnique({
      where: { id },
      select: {
        id: true,
        customerName: true,
        phone: true,
        email: true,
        productId: true,
        quantity: true,
        message: true,
        source: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            productCode: true,
            isActive: true,
            category: { select: { name: true, slug: true } },
            images: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              take: 1,
              select: { url: true, alt: true },
            },
          },
        },
      },
    });

    if (!raw) return { ok: false, error: "not-found" };

    const firstImage = raw.product?.images[0] ?? null;
    const product: AdminOrderDetailProduct | null = raw.product
      ? {
          id: raw.product.id,
          name: raw.product.name,
          slug: raw.product.slug,
          productCode: raw.product.productCode ?? "",
          isActive: raw.product.isActive,
          categoryName: raw.product.category?.name ?? null,
          categorySlug: raw.product.category?.slug ?? null,
          imageUrl:
            firstImage && isUsableImageUrl(firstImage.url)
              ? firstImage.url
              : null,
          imageAlt: firstImage?.alt ?? null,
        }
      : null;

    return {
      ok: true,
      data: {
        id: raw.id,
        customerName: raw.customerName,
        phone: raw.phone,
        email: raw.email,
        productId: raw.productId,
        quantity: raw.quantity,
        message: raw.message,
        source: raw.source,
        status: raw.status,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        product,
      },
    };
  } catch (error) {
    console.error("Failed to load order detail", error);
    return { ok: false, error: "database" };
  }
}