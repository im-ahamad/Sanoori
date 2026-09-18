import "server-only";
import { db } from "@/lib/db";

/**
 * Server-only data access for the admin dashboard.
 *
 * Never import this module from client components. Errors are surfaced as
 * discriminated results so pages can render a friendly error state without
 * leaking internal database messages to the user.
 */

export type DashboardResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface AdminDashboardStats {
  products: number;
  categories: number;
  inquiries: number;
  newInquiries: number;
}

export async function getAdminDashboardStats(): Promise<
  DashboardResult<AdminDashboardStats>
> {
  try {
    const [products, categories, inquiries, newInquiries] =
      await Promise.all([
        db.product.count({ where: { isActive: true } }),
        db.category.count({ where: { isActive: true } }),
        db.inquiry.count(),
        db.inquiry.count({ where: { status: "NEW" } }),
      ]);

    return { ok: true, data: { products, categories, inquiries, newInquiries } };
  } catch (error) {
    console.error("Failed to load admin dashboard stats", error);
    return { ok: false, error: "database" };
  }
}

export interface RecentInquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  productName: string | null;
  source: string;
  status: string;
  createdAt: Date;
}

export async function getRecentInquiries(
  limit = 5
): Promise<DashboardResult<RecentInquiry[]>> {
  try {
    const inquiries = await db.inquiry.findMany({
      take: Math.min(Math.max(limit, 1), 25),
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
      },
    });

    return {
      ok: true,
      data: inquiries.map((inquiry) => ({
        id: inquiry.id,
        customerName: inquiry.customerName,
        phone: inquiry.phone,
        email: inquiry.email,
        productName: inquiry.product?.name ?? null,
        source: inquiry.source,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      })),
    };
  } catch (error) {
    console.error("Failed to load recent inquiries", error);
    return { ok: false, error: "database" };
  }
}