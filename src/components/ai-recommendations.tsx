import { getProductRecommendations } from "@/ai/flows/product-recommendations";
import { getProductById } from "@/lib/data";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

interface AiRecommendationsProps {
  productId: string;
}

export async function AiRecommendations({ productId }: AiRecommendationsProps) {
  const currentProduct = await getProductById(productId);

  if (!currentProduct) return null;

  // In a real app, the AI would return dynamic IDs.
  // For this mock, we'll get some static IDs to show the feature.
  const mockRecommendationFlow = async (input: {productDescription: string}) => {
    // A simple mock logic to return other products from the list
    if (input.productDescription.includes('AuraPhone')) return { recommendedProductIds: ['prod4', 'prod3'] };
    if (input.productDescription.includes('ZenBook')) return { recommendedProductIds: ['prod6', 'prod5'] };
    return { recommendedProductIds: ['prod1', 'prod2'] };
  };
  
  const { recommendedProductIds } = await mockRecommendationFlow({
    productDescription: currentProduct.description,
  });

  if (!recommendedProductIds || recommendedProductIds.length === 0) {
    return null;
  }

  const recommendedProducts = (
    await Promise.all(recommendedProductIds.map((id) => getProductById(id)))
  ).filter(Boolean);

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="my-12 md:my-24">
      <h2 className="mb-8 font-headline text-3xl font-bold tracking-tight">You Might Also Like</h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {recommendedProducts.map((product) => (
          product && <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
