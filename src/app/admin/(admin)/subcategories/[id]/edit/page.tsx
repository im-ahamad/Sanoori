import { getAdminSubcategoryDetail } from "@/lib/admin/subcategories";
import { getAllCategoriesForSubcategoryForm } from "@/lib/admin/subcategories";
import { AdminSubcategoryEditForm } from "./form";

export const metadata = {
  title: "Edit Subcategory",
};

interface AdminSubcategoryEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSubcategoryEditPage({
  params,
}: AdminSubcategoryEditPageProps) {
  const { id } = await params;
  const [subcategoryResult, categoriesResult] = await Promise.all([
    getAdminSubcategoryDetail(id),
    getAllCategoriesForSubcategoryForm(),
  ]);

  const subcategory = subcategoryResult.ok ? subcategoryResult.data : null;
  const categories = categoriesResult.ok ? categoriesResult.data : [];

  return <AdminSubcategoryEditForm subcategory={subcategory} categories={categories} />;
}