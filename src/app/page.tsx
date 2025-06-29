import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { allProducts } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredProducts = allProducts.slice(0, 4);

  return (
    <div className="container mx-auto px-4">
      <section className="relative my-12 text-center md:my-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Discover the Future of Tech
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Explore our curated selection of cutting-edge electronics. Built for performance, designed for life.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/products">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin">
                Admin Panel
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="my-12 md:my-24">
        <h2 className="mb-8 font-headline text-3xl font-bold tracking-tight">Featured Products</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
