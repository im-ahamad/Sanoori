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
  customers: number;
  totalOrders: number;
  newOrders: number;
  contactedOrders: number;
  completedOrders: number;
}

export async function getAdminDashboardStats(): Promise<
  DashboardResult<AdminDashboardStats>
> {
  try {
    const [
      products,
      categories,
      // Count unique customers by phone
      uniqueCustomers,
      totalOrders,
      newOrders,
      contactedOrders,
      completedOrders,
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.category.count({ where: { isActive: true } }),
      // Count unique customers (by phone)
      db.inquiry.groupBy({
        by: ["phone"],
        _count: { phone: true },
      }),
      db.inquiry.count(),
      db.inquiry.count({ where: { status: "NEW" } }),
      db.inquiry.count({ where: { status: "CONTACTED" } }),
      db.inquiry.count({ where: { status: "COMPLETED" } }),
    ]);

    return {
      ok: true,
      data: {
        products,
        categories,
        customers: uniqueCustomers.length,
        totalOrders,
        newOrders,
        contactedOrders,
        completedOrders,
      },
    };
  } catch (error) {
    console.error("Failed to load admin dashboard stats", error);
    return { ok: false, error: "database" };
  }
}

export interface RecentOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  productName: string | null;
  quantity: number | null;
  status: string;
  createdAt: Date;
}

export async function getRecentOrders(
  limit = 5
): Promise<DashboardResult<RecentOrder[]>> {
  try {
    const orders = await db.inquiry.findMany({
      take: Math.min(Math.max(limit, 1), 25),
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
      },
    });

    return {
      ok: true,
      data: orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        productName: order.product?.name ?? null,
        quantity: order.quantity,
        status: order.status,
        createdAt: order.createdAt,
      })),
    };
  } catch (error) {
    console.error("Failed to load recent orders", error);
    return { ok: false, error: "database" };
  }
}