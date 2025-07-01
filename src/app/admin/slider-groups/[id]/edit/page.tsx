import { SliderGroupForm } from '@/components/admin/slider-group-form';
import { getSliderGroupById, getAllCategories, getAllProductTags } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function EditSliderGroupPage({ params: { id } }: { params: { id: string } }) {
  const [sliderGroup, categories, tags] = await Promise.all([
    getSliderGroupById(id),
    getAllCategories(),
    getAllProductTags(),
  ]);

  if (!sliderGroup) {
    notFound();
  }

  const formOptions = {
    categories: categories.map(c => ({ value: c.id, label: c.name })),
    tags: tags.map(t => ({ value: t, label: t })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Slider Group</h1>
      <SliderGroupForm sliderGroup={sliderGroup} formOptions={formOptions} />
    </div>
  );
}
