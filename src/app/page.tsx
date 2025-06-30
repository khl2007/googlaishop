import { ProductCard } from "@/components/product-card";
import { getAllProducts } from "@/lib/data";
import { HeroSlider } from "@/components/hero-slider";

export default async function Home() {
  const allProducts = await getAllProducts();
  const featuredProducts = allProducts.slice(0, 8); // Using first 8 products to demonstrate scrolling

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <HeroSlider />
      
      <section className="my-12 md:my-24">
        <h2 className="mb-2 px-4 sm:px-0 font-headline text-3xl font-bold tracking-tight">Featured Products</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 px-4 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {featuredProducts.map((product) => (
            <div key={product.id} className="w-64 flex-shrink-0">
              <ProductCard product={product} showButton={false} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
