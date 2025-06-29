import { CategoryForm } from "@/components/admin/category-form";
import { getAllCategories } from "@/lib/data";

export default function NewCategoryPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Category</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}
