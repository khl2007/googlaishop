
import { getCategoryById, getAllCategories } from "@/lib/data";
import { CategoryForm } from "@/components/admin/category-form";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const [category, allCategories] = await Promise.all([
    getCategoryById(params.id),
    getAllCategories(),
  ]);

  if (!category) {
    notFound();
  }

  // A category cannot be its own parent.
  const parentCategories = allCategories.filter(c => c.id !== category.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
      <CategoryForm category={category} categories={parentCategories} />
    </div>
  );
}
