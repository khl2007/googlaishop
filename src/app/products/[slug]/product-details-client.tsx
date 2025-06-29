"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product, ProductVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { ProductVariantSelectors } from "@/components/product-variant-selectors";

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, 1);
  };

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <div>
        <Image
          src={selectedVariant.image}
          alt={selectedVariant.name}
          width={600}
          height={600}
          className="w-full rounded-lg object-cover shadow-lg aspect-square"
          data-ai-hint="product image"
          key={selectedVariant.id} 
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 text-3xl font-bold tracking-tight text-primary">
          ${selectedVariant.price.toFixed(2)}
        </p>
        <p className="mt-6 text-base text-muted-foreground">{product.description}</p>
        
        <div className="mt-8">
          <ProductVariantSelectors 
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
        </div>

        <div className="mt-auto pt-8">
          <Button
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddToCart}
            disabled={selectedVariant.stock <= 0}
          >
            {selectedVariant.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
