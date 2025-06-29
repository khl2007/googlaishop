import { getProductById, getAllCategories } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  const categories = await getAllCategories();

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
