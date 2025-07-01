
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "./product-details-client";
import { AiRecommendations } from "@/components/ai-recommendations";
import { getProductBySlug } from "@/lib/data";
import { getUser } from "@/lib/session";

export default async function ProductPage({ params: { slug } }: { params: { slug: string } }) {
  const [product, user] = await Promise.all([
    getProductBySlug(slug),
    getUser(),
  ]);

  if (!product || !product.variants || product.variants.length === 0) {
    notFound();
  }

  return (
    <div className="w-full">
      <ProductDetailsClient product={product} user={user} />
      <div className="container mx-auto my-12 px-4">
        <AiRecommendations productId={product.id} />
      </div>
    </div>
  );
}
