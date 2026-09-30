import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Settings,
  FileText,
  SquareKanban,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** "ready" items are fully functional; "soon" items are placeholders. */
  status: "ready" | "soon";
  /** Required permission to show this navigation item. */
  permission: string;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, status: "ready", permission: "dashboard:read" },
  { label: "Orders", href: "/admin/orders", icon: FileText, status: "ready", permission: "orders:read" },
  { label: "Products", href: "/admin/products", icon: Package, status: "ready", permission: "products:read" },
  { label: "Categories", href: "/admin/categories", icon: Tags, status: "ready", permission: "categories:read" },
  { label: "Subcategories", href: "/admin/subcategories", icon: SquareKanban, status: "ready", permission: "subcategories:read" },
  { label: "Customers", href: "/admin/customers", icon: Users, status: "ready", permission: "customers:read" },
  { label: "Admin Users", href: "/admin/admin-users", icon: UserCog, status: "ready", permission: "admin-users:read" },
  { label: "Settings", href: "/admin/settings", icon: Settings, status: "ready", permission: "settings:read" },
];