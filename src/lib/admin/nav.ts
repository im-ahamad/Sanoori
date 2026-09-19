import {
  LayoutDashboard,
  Package,
  Tags,
  MessagesSquare,
  Settings,
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
  { label: "Products", href: "/admin/products", icon: Package, status: "ready" },
  { label: "Categories", href: "/admin/categories", icon: Tags, status: "soon" },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: MessagesSquare,
    status: "ready",
  },
  { label: "Settings", href: "/admin/settings", icon: Settings, status: "soon" },
];