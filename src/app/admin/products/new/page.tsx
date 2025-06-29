import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories } from "@/lib/data";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
