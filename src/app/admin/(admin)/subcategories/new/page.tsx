import { getAllCategoriesForSubcategoryForm } from "@/lib/admin/subcategories";
import { AdminSubcategoryNewForm } from "./form";

export const metadata = {
  title: "New Subcategory",
};

export default async function AdminSubcategoryNewPage() {
  const categoriesResult = await getAllCategoriesForSubcategoryForm();
  const categories = categoriesResult.ok ? categoriesResult.data : [];
  return <AdminSubcategoryNewForm categories={categories} />;
}