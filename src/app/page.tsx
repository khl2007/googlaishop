import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getAllProducts } from "@/lib/data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const allProducts = await getAllProducts();
  const featuredProducts = allProducts.slice(0, 4);

  return (
    <div className="container mx-auto px-4">
      <section className="relative my-12 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-teal-400 p-8 text-center text-white md:my-16">
        <div className="relative z-10 mx-auto max-w-4xl">
          <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Everything You Need For Your Smart Device
          </h1>
          <p className="mb-8 text-lg text-white/90 md:text-xl">
            With <span className="font-bold">Zain</span>, explore our curated selection of cutting-edge electronics.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/products">
                Shop The Collection <ArrowRight className="ml-2 h-5 w-5" />
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
