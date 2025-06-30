import { ProductCard } from "@/components/product-card";
import { getAllProducts } from "@/lib/data";
import { HeroSlider } from "@/components/hero-slider";

export default async function Home() {
  const allProducts = await getAllProducts();
  const featuredProducts = allProducts.filter(p => p.isFeatured).slice(0, 4);

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <HeroSlider />
      
      <section className="my-12 md:my-24 px-4">
        <h2 className="mb-8 font-headline text-3xl font-bold tracking-tight">Featured Products</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} showButton={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
