
import { getProductById, getAllCategories, getVendors } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params: { id } }: { params: { id: string } }) {
  const [product, categories, vendors] = await Promise.all([
    getProductById(id),
    getAllCategories(),
    getVendors()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <ProductForm product={product} categories={categories} vendors={vendors} />
    </div>
  );
}
