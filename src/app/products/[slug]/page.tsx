import { notFound } from "next/navigation";
import { ProductDetailsClient } from "./product-details-client";
import { AiRecommendations } from "@/components/ai-recommendations";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { Product } from "@/lib/types";
import { getProductBySlug } from "@/lib/data";
import { getUser } from "@/lib/session";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, user] = await Promise.all([
    getProductBySlug(params.slug),
    getUser(),
  ]);

  if (!product || !product.variants || product.variants.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto my-12 px-4">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <ProductDetailsClient product={product} user={user} />
        <AiRecommendations productId={product.id} />
    </div>
  );
}
