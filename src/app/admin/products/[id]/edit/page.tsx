
import { getProductById, getAllCategories, getVendors } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params: { id } }: { params: { id: string } }) {
  const [product, allCategories, vendors] = await Promise.all([
    getProductById(id),
    getAllCategories(),
    getVendors()
  ]);

  if (!product) {
    notFound();
  }
  
  // A category is a "parent" if its ID appears in another category's `parentId` field.
  const parentCategoryIds = new Set(allCategories.map(c => c.parentId).filter(Boolean));
  
  // Products can only be assigned to "leaf" categories (those that are not parents).
  // We also need to include the product's current category in the list, even if it has since become a parent,
  // so that it doesn't suddenly appear to have no category assigned.
  const leafCategories = allCategories.filter(c => !parentCategoryIds.has(c.id) || c.id === product.categoryId);


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <ProductForm product={product} categories={leafCategories} vendors={vendors} />
    </div>
  );
}
