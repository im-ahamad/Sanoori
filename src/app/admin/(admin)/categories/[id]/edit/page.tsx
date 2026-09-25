import { notFound } from "next/navigation";
import { getAdminCategoryDetail } from "@/lib/admin/categories";
import { metadata } from "./metadata";
import { AdminCategoryEditForm } from "./form";

export { metadata };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCategoryEditPage(props: PageProps) {
  const { id } = await props.params;

  const detailResult = await getAdminCategoryDetail(id);

  if (!detailResult.ok) {
    if (detailResult.error === "not-found") notFound();
  }

  return <AdminCategoryEditForm category={detailResult.ok ? detailResult.data : null} />;
}