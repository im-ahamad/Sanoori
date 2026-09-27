import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Settings,
  FileText,
  SquareKanban,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** "ready" items are fully functional; "soon" items are placeholders. */
  status: "ready" | "soon";
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, status: "ready" },
  { label: "Orders", href: "/admin/orders", icon: FileText, status: "ready" },
  { label: "Products", href: "/admin/products", icon: Package, status: "ready" },
  { label: "Categories", href: "/admin/categories", icon: Tags, status: "ready" },
  { label: "Subcategories", href: "/admin/subcategories", icon: SquareKanban, status: "ready" },
  { label: "Customers", href: "/admin/customers", icon: Users, status: "ready" },
  { label: "Settings", href: "/admin/settings", icon: Settings, status: "ready" },
];