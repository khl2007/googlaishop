import { getActiveHomeSections } from "@/lib/data";
import { HeroSlider } from "@/components/hero-slider";
import { HomeSectionFeed } from "@/components/home-section-feed";

export default async function Home() {
  const sections = await getActiveHomeSections();

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <HeroSlider />
      
      {sections.map(section => (
        <HomeSectionFeed key={section.id} section={section} />
      ))}
    </div>
  );
}
