import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories, getVendors } from "@/lib/data";

export default async function NewProductPage() {
  const [categories, vendors] = await Promise.all([
    getAllCategories(),
    getVendors()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <ProductForm categories={categories} vendors={vendors} />
    </div>
  );
}
