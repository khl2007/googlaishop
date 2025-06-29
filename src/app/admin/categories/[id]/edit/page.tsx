
import { getCategoryById, getAllCategories } from "@/lib/data";
import { CategoryForm } from "@/components/admin/category-form";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategoryById(params.id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  );
}
