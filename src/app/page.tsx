import { getActiveHomeSections } from "@/lib/data";
import { HeroSlider } from "@/components/hero-slider";
import { HomeSectionFeed } from "@/components/home-section-feed";
import { CategorySlider } from "@/components/category-slider";

export default async function Home() {
  const sections = await getActiveHomeSections();

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <HeroSlider />
      
      {sections.map(section => {
        if (section.type === 'slider_group' && section.sliderGroup) {
          return <CategorySlider key={section.id} sliderGroup={section.sliderGroup} />;
        }
        return <HomeSectionFeed key={section.id} section={section} />;
      })}
    </div>
  );
}
