
"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product, ProductVariant, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { ProductVariantSelectors } from "@/components/product-variant-selectors";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductDetailsClientProps {
  product: Product;
  user: User | null;
}

export function ProductDetailsClient({ product, user }: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const isCustomer = !user || user.role === 'customer';

  const handleQuantityChange = (newQuantity: number) => {
    if (isNaN(newQuantity) || newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > selectedVariant.stock) {
      setQuantity(selectedVariant.stock);
    } else {
      setQuantity(newQuantity);
    }
  };

  return (
    <>
      <div className="grid gap-12 md:grid-cols-2 pb-24 md:pb-0">
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
              onVariantChange={(variant) => {
                setSelectedVariant(variant);
                // Reset quantity if it exceeds new variant's stock
                if (quantity > variant.stock) {
                  setQuantity(variant.stock > 0 ? 1 : 0);
                }
              }}
            />
          </div>

          {/* Desktop Add to Cart */}
          <div className="mt-auto pt-8 hidden md:block">
            {isCustomer && (
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-md border">
                  <Button variant="ghost" size="icon" className="rounded-r-none" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={selectedVariant.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="w-16 border-x-0 border-y-0 text-center focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon" className="rounded-l-none" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= selectedVariant.stock}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stock <= 0 || quantity > selectedVariant.stock}
                >
                  {selectedVariant.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Add to Cart Bar */}
      {isCustomer && (
        <div className="md:hidden fixed bottom-16 left-0 z-40 w-full border-t bg-background p-4 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <Button variant="ghost" size="icon" className="h-11 rounded-r-none" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={selectedVariant.stock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                className="w-12 h-11 border-x-0 border-y-0 text-center focus-visible:ring-0"
              />
              <Button variant="ghost" size="icon" className="h-11 rounded-l-none" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= selectedVariant.stock}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={selectedVariant.stock <= 0 || quantity > selectedVariant.stock}
            >
              {selectedVariant.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

