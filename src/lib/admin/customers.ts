import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export const CUSTOMERS_PAGE_SIZE = 20;

export type CustomersResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface CustomerListItem {
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  lastOrderAt: Date;
}

export interface CustomerList {
  items: CustomerListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: {
    q: string;
    sort: "newest" | "oldest";
  };
}

export interface CustomerFilters {
  q?: string;
  sort?: string;
  page?: number;
}

export interface CustomerDetail {
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  lastOrderAt: Date;
  orders: {
    id: string;
    productName: string | null;
    productCode: string | null;
    quantity: number | null;
    status: string;
    createdAt: Date;
  }[];
}

export type CustomerDetailResult =
  | { ok: true; data: CustomerDetail }
  | { ok: false; error: "database" | "not-found" };

function parsePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function isValidSort(value: string | undefined): value is "newest" | "oldest" {
  return value === "newest" || value === "oldest";
}

export async function listAdminCustomers(
  filters: CustomerFilters = {}
): Promise<CustomersResult<CustomerList>> {
  const q = filters.q?.trim().slice(0, 100) ?? "";
  const sort = isValidSort(filters.sort) ? filters.sort : "newest";
  const page = parsePositiveInt(filters.page, 1);

  try {
    // Get unique customers by grouping inquiries by phone+name
    // We need to do this in two steps: first get raw data, then aggregate
    const where: Prisma.InquiryWhereInput = {};
    if (q) {
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    // Get all matching inquiries to aggregate
    const inquiries = await db.inquiry.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      select: {
        customerName: true,
        phone: true,
        email: true,
        createdAt: true,
        product: { select: { name: true, productCode: true } },
        quantity: true,
        status: true,
        id: true,
      },
    });

    // Group by phone (primary) and name
    const customerMap = new Map<
      string,
      {
        name: string;
        phone: string;
        email: string | null;
        totalOrders: number;
        lastOrderAt: Date;
        orders: CustomerDetail["orders"];
      }
    >();

    for (const inquiry of inquiries) {
      const key = inquiry.phone;
      const existing = customerMap.get(key);
      const order = {
        id: inquiry.id,
        productName: inquiry.product?.name ?? null,
        productCode: inquiry.product?.productCode ?? null,
        quantity: inquiry.quantity,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      };

      if (existing) {
        existing.totalOrders += 1;
        if (inquiry.createdAt > existing.lastOrderAt) {
          existing.lastOrderAt = inquiry.createdAt;
        }
        existing.orders.push(order);
        // Use the most recent name/email
        existing.name = inquiry.customerName;
        existing.email = inquiry.email ?? existing.email;
      } else {
        customerMap.set(key, {
          name: inquiry.customerName,
          phone: inquiry.phone,
          email: inquiry.email,
          totalOrders: 1,
          lastOrderAt: inquiry.createdAt,
          orders: [order],
        });
      }
    }

    // Convert to array and sort
    const customers = Array.from(customerMap.values());
    customers.sort((a, b) =>
      sort === "oldest"
        ? a.lastOrderAt.getTime() - b.lastOrderAt.getTime()
        : b.lastOrderAt.getTime() - a.lastOrderAt.getTime()
    );

    const total = customers.length;
    const pageSize = CUSTOMERS_PAGE_SIZE;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = customers.slice(start, end);

    const items: CustomerListItem[] = paginated.map((c) => ({
      name: c.name,
      phone: c.phone,
      email: c.email,
      totalOrders: c.totalOrders,
      lastOrderAt: c.lastOrderAt,
    }));

    return {
      ok: true,
      data: {
        items,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        filters: { q, sort },
      },
    };
  } catch (error) {
    console.error("Failed to list customers", error);
    return { ok: false, error: "database" };
  }
}

export async function getAdminCustomerDetail(
  phone: string
): Promise<CustomerDetailResult> {
  try {
    const inquiries = await db.inquiry.findMany({
      where: { phone },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        phone: true,
        email: true,
        createdAt: true,
        product: { select: { name: true, productCode: true } },
        quantity: true,
        status: true,
      },
    });

    if (inquiries.length === 0) {
      return { ok: false, error: "not-found" };
    }

    const first = inquiries[0];
    const orders = inquiries.map((i) => ({
      id: i.id,
      productName: i.product?.name ?? null,
      productCode: i.product?.productCode ?? null,
      quantity: i.quantity,
      status: i.status,
      createdAt: i.createdAt,
    }));

    return {
      ok: true,
      data: {
        name: first.customerName,
        phone: first.phone,
        email: first.email,
        totalOrders: inquiries.length,
        lastOrderAt: first.createdAt,
        orders,
      },
    };
  } catch (error) {
    console.error("Failed to load customer detail", error);
    return { ok: false, error: "database" };
  }
}