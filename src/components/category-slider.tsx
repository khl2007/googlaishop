import { getProductsForCategoryByTags } from "@/lib/data";
import type { SliderGroup } from "@/lib/types";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ProductCard } from "./product-card";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

interface CategorySliderProps {
  sliderGroup: SliderGroup;
}

export async function CategorySlider({ sliderGroup }: CategorySliderProps) {
  if (!sliderGroup.category_id || !sliderGroup.tags) {
    return null;
  }

  const products = await getProductsForCategoryByTags(
    sliderGroup.category_id,
    sliderGroup.tags
  );

  if (!products || products.length === 0) {
    return null;
  }

  const basis = `1/${sliderGroup.slides_per_view}`;

  return (
    <section className={cn(
        "mb-12",
        sliderGroup.style === 'full-bleed' && "-mt-12"
    )}>
       <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          plugins={[
              Autoplay({
                delay: sliderGroup.autoplay_speed,
                stopOnInteraction: true,
              }),
          ]}
          className="w-full"
        >
          <CarouselContent className={cn(
              sliderGroup.style === 'full-bleed' ? "ml-0" : "-ml-4"
          )}>
            {products.map((product) => (
              <CarouselItem key={product.id} className={cn(
                  sliderGroup.style === 'full-bleed' ? "pl-4" : "pl-4",
                  "md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              )} style={{ flex: `0 0 ${100 / sliderGroup.slides_per_view}%`}}>
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
    </section>
  );
}
