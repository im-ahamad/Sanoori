import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { InquiryStatus, InquirySource } from "@/generated/prisma/enums";
import {
  isInquirySource,
  isInquiryStatus,
} from "@/lib/inquiries";

export const ORDERS_PAGE_SIZE = 20;

export type OrdersResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface OrderListItem {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  productName: string | null;
  productCode: string | null;
  quantity: number | null;
  source: InquirySource;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderList {
  items: OrderListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: {
    q: string;
    status: InquiryStatus | null;
    source: InquirySource | null;
    sort: "newest" | "oldest";
  };
}

export interface OrderFilters {
  q?: string;
  status?: string;
  source?: string;
  sort?: string;
  page?: number;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function isValidSort(value: string | undefined): value is "newest" | "oldest" {
  return value === "newest" || value === "oldest";
}

export async function listAdminOrders(
  filters: OrderFilters = {}
): Promise<OrdersResult<OrderList>> {
  const q = filters.q?.trim().slice(0, 100) ?? "";
  const status = isInquiryStatus(filters.status) ? filters.status : null;
  const source = isInquirySource(filters.source) ? filters.source : null;
  const sort = isValidSort(filters.sort) ? filters.sort : "newest";
  const page = parsePositiveInt(filters.page, 1);

  const where: Prisma.InquiryWhereInput = {};

  if (q) {
    where.OR = [
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { product: { is: { name: { contains: q, mode: "insensitive" } } } },
      { product: { is: { productCode: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (status) where.status = status;
  if (source) where.source = source;

  const orderBy: Prisma.InquiryOrderByWithRelationInput = {
    createdAt: sort === "oldest" ? "asc" : "desc",
  };

  try {
    const [rawItems, total] = await Promise.all([
      db.inquiry.findMany({
        where,
        orderBy,
        skip: (page - 1) * ORDERS_PAGE_SIZE,
        take: ORDERS_PAGE_SIZE,
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
          product: { select: { name: true, productCode: true } },
        },
      }),
      db.inquiry.count({ where }),
    ]);

    const items: OrderListItem[] = rawItems.map((item) => ({
      ...item,
      productName: item.product?.name ?? null,
      productCode: item.product?.productCode ?? null,
    }));

    return {
      ok: true,
      data: {
        items,
        page,
        pageSize: ORDERS_PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
        filters: { q, status, source, sort },
      },
    };
  } catch (error) {
    console.error("Failed to list orders", error);
    return { ok: false, error: "database" };
  }
}

export async function getOrderStats(): Promise<
  | { ok: true; data: { new: number; contacted: number; completed: number } }
  | { ok: false; error: "database" }
> {
  try {
    const [newCount, contactedCount, completedCount] = await Promise.all([
      db.inquiry.count({ where: { status: "NEW" } }),
      db.inquiry.count({ where: { status: "CONTACTED" } }),
      db.inquiry.count({ where: { status: "COMPLETED" } }),
    ]);

    return {
      ok: true,
      data: { new: newCount, contacted: contactedCount, completed: completedCount },
    };
  } catch (error) {
    console.error("Failed to get order stats", error);
    return { ok: false, error: "database" };
  }
}