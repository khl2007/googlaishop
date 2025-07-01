
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: Product;
  showButton?: boolean;
}

export function ProductCard({ product, showButton = true }: ProductCardProps) {
  const firstVariant = product.variants[0];

  // If a product has no variants, don't render it. This prevents crashes.
  if (!firstVariant) {
    return null;
  }

  const imageToShow = product.mainImage || firstVariant.image;

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="block overflow-hidden aspect-square relative">
          <Image
            src={imageToShow || "https://placehold.co/600x600.png"}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-300 ease-in-out hover:scale-105"
            data-ai-hint="product image"
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <h3 className="text-lg font-semibold font-headline">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          From ${firstVariant.price.toFixed(2)}
        </p>
      </CardContent>
      {showButton && (
        <CardFooter className="p-4 pt-0">
           <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={`/products/${product.slug}`}>View Product</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
