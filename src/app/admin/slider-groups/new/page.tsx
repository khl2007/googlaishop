import { SliderGroupForm } from '@/components/admin/slider-group-form';
import { getAllCategories, getAllProductTags } from '@/lib/data';

export default async function NewSliderGroupPage() {
  const [categories, tags] = await Promise.all([
    getAllCategories(),
    getAllProductTags(),
  ]);

  const formOptions = {
    categories: categories.map(c => ({ value: c.id, label: c.name })),
    tags: tags.map(t => ({ value: t, label: t })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Slider Group</h1>
      <SliderGroupForm formOptions={formOptions} />
    </div>
  );
}
