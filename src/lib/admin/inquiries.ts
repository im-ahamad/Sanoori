import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { InquirySource, InquiryStatus } from "@/generated/prisma/enums";
import {
  isInquirySource,
  isInquiryStatus,
} from "@/lib/inquiries";

export const INQUIRIES_PAGE_SIZE = 20;

export type AdminInquiriesResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface AdminInquiryListItem {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  productName: string | null;
  quantity: number | null;
  source: InquirySource;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminInquiryList {
  items: AdminInquiryListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: {
    q: string;
    status: InquiryStatus | null;
    source: InquirySource | null;
  };
}

export interface AdminInquiryFilters {
  q?: string;
  status?: string;
  source?: string;
  page?: number;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function isUsableImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export async function listAdminInquiries(
  filters: AdminInquiryFilters = {}
): Promise<AdminInquiriesResult<AdminInquiryList>> {
  const q = filters.q?.trim().slice(0, 100) ?? "";
  const status = isInquiryStatus(filters.status) ? filters.status : null;
  const source = isInquirySource(filters.source) ? filters.source : null;
  const page = parsePositiveInt(filters.page, 1);

  const where: Prisma.InquiryWhereInput = {};
  if (q) {
    where.OR = [
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { product: { is: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (status) where.status = status;
  if (source) where.source = source;

  try {
    const [rawItems, total] = await Promise.all([
      db.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * INQUIRIES_PAGE_SIZE,
        take: INQUIRIES_PAGE_SIZE,
        select: {
          id: true,
          customerName: true,
          phone: true,
          email: true,
          quantity: true,
          source: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          product: { select: { name: true } },
        },
      }),
      db.inquiry.count({ where }),
    ]);

    const items: AdminInquiryListItem[] = rawItems.map((item) => ({
      ...item,
      productName: item.product?.name ?? null,
    }));

    return {
      ok: true,
      data: {
        items,
        page,
        pageSize: INQUIRIES_PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / INQUIRIES_PAGE_SIZE)),
        filters: { q, status, source },
      },
    };
  } catch (error) {
    console.error("Failed to list inquiries", error);
    return { ok: false, error: "database" };
  }
}

export interface AdminInquiryProduct {
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

export interface AdminInquiryDetail {
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
  product: AdminInquiryProduct | null;
}

export type AdminInquiryDetailResult =
  | { ok: true; data: AdminInquiryDetail }
  | { ok: false; error: "database" | "not-found" };

export async function getAdminInquiryDetail(
  id: string
): Promise<AdminInquiryDetailResult> {
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
    const product: AdminInquiryProduct | null = raw.product
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
    console.error("Failed to load inquiry detail", error);
    return { ok: false, error: "database" };
  }
}