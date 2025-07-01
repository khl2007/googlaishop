import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories, getVendors } from "@/lib/data";

export default async function NewProductPage() {
  const [allCategories, vendors] = await Promise.all([
    getAllCategories(),
    getVendors()
  ]);

  // A category is a "parent" if its ID appears in another category's `parentId` field.
  const parentCategoryIds = new Set(allCategories.map(c => c.parentId).filter(Boolean));
  
  // Products can only be assigned to "leaf" categories (those that are not parents).
  const leafCategories = allCategories.filter(c => !parentCategoryIds.has(c.id));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <ProductForm categories={leafCategories} vendors={vendors} />
    </div>
  );
}
