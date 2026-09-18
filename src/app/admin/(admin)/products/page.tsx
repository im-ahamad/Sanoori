import { Package } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <PlaceholderPage
      title="Products"
      description="Manage your product catalogue: create, edit, and organize listings."
      comingSoonDescription="Product management has not been built yet. It will be added in a future step of the project."
      icon={<Package className="size-8 text-muted-foreground" />}
    />
  );
}