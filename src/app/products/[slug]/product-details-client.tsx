"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product, ProductVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <div>
        <Image
          src={selectedVariant.image}
          alt={selectedVariant.name}
          width={600}
          height={600}
          className="w-full rounded-lg object-cover shadow-lg"
          data-ai-hint="product image"
        />
      </div>
      <div>
        <h1 className="text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 text-3xl font-bold tracking-tight text-primary">
          ${selectedVariant.price.toFixed(2)}
        </p>
        <p className="mt-6 text-base text-muted-foreground">{product.description}</p>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Select Variant</h2>
          <RadioGroup
            value={selectedVariant.id}
            onValueChange={(variantId) => {
              const variant = product.variants.find((v) => v.id === variantId);
              if (variant) setSelectedVariant(variant);
            }}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {product.variants.map((variant) => (
              <Label
                key={variant.id}
                htmlFor={variant.id}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                  { "border-primary": selectedVariant.id === variant.id }
                )}
              >
                <RadioGroupItem value={variant.id} id={variant.id} className="sr-only" />
                <span className="font-semibold">{variant.name}</span>
                <span className="text-sm text-muted-foreground">${variant.price.toFixed(2)}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="mt-8">
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
