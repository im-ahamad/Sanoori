import { Tags } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const metadata = {
  title: "Categories",
};

export default function AdminCategoriesPage() {
  return (
    <PlaceholderPage
      title="Categories"
      description="Organize the catalogue into categories and subcategories."
      comingSoonDescription="Category management has not been built yet. It will be added in a future step of the project."
      icon={<Tags className="size-8 text-muted-foreground" />}
    />
  );
}