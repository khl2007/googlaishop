
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { Product, ProductVariant, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { ProductVariantSelectors } from "@/components/product-variant-selectors";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface ProductDetailsClientProps {
  product: Product;
  user: User | null;
}

export function ProductDetailsClient({ product, user }: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  const images = useMemo(() => {
      try {
          return product.images ? JSON.parse(product.images) : [];
      } catch {
          return [];
      }
  }, [product.images]);

  const [displayImage, setDisplayImage] = useState(product.mainImage || selectedVariant.image || images[0]);

  useEffect(() => {
      if (selectedVariant.image && !selectedVariant.image.includes('placehold.co')) {
          setDisplayImage(selectedVariant.image);
      }
  }, [selectedVariant]);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity, { openCart: false });
  };

  const showAddToCart = !(user && ['admin', 'vendor', 'delivery'].includes(user.role));

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/products">Products</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery Column */}
          <div className="md:sticky md:top-24 h-max">
            <div className="aspect-square w-full relative mb-4 rounded-lg overflow-hidden shadow-lg">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint="product image"
                    key={displayImage} // Re-render on image change for transition
                    priority
                />
            </div>
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {images.map((img: string, idx: number) => (
                        <button 
                            key={idx} 
                            onClick={() => setDisplayImage(img)} 
                            className={cn(
                                "aspect-square relative rounded-md overflow-hidden transition-all",
                                displayImage === img ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
                            )}
                        >
                            <Image src={img} alt={`Product image ${idx + 1}`} fill className="object-cover" data-ai-hint="product image thumbnail" />
                        </button>
                    ))}
                </div>
            )}
          </div>
          
          {/* Details Column */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">
                {product.name}
            </h1>
            
            <p className="text-3xl font-bold tracking-tight text-primary mt-4">
                ${selectedVariant.price.toFixed(2)}
            </p>
            
            {product.shortDescription && (
                <p className="text-lg text-muted-foreground leading-relaxed mt-6">{product.shortDescription}</p>
            )}

            <div
                className="wysiwyg-content my-6 text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
            />
            
            <div className="space-y-6">
                <ProductVariantSelectors 
                    product={product}
                    selectedVariant={selectedVariant}
                    onVariantChange={(variant) => {
                        setSelectedVariant(variant);
                        if (quantity > variant.stock) {
                        setQuantity(variant.stock > 0 ? 1 : 0);
                        }
                    }}
                />
            </div>

            {/* Desktop Add to Cart */}
            <div className="mt-auto pt-8 hidden md:block">
                {showAddToCart && (
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
      </div>
      
      {/* Mobile Add to Cart Bar */}
      {showAddToCart && (
        <div
          className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-2px_4px_rgba(0,0,0,0.1)]"
        >
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
    </div>
  );
}
