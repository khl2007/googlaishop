import { ProductCard } from "@/components/product-card";
import { getProductsForSection } from "@/lib/data";
import type { HomeSection } from "@/lib/types";

export async function HomeSectionFeed({ section }: { section: HomeSection }) {
  const products = await getProductsForSection(section);

  if (!section.isActive || products.length === 0) {
    return null;
  }

  return (
    <section className="my-12 md:my-16">
      <h4 className="mb-2 px-4 sm:px-0 font-headline text-3xl font-bold tracking-tight">{section.title}</h4>
      <div className="flex gap-6 overflow-x-auto pb-4 px-4 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {products.map((product) => (
          <div key={product.id} className="w-64 flex-shrink-0">
            <ProductCard product={product} showButton={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
