import { NextResponse } from 'next/server';
import { getAllSliderGroups, createSliderGroup, getAllCategories, getAllProductTags } from '@/lib/data';
import { revalidateTag } from 'next/cache';

export async function GET() {
  try {
    const sliderGroups = await getAllSliderGroups();
    const [categories, tags] = await Promise.all([
      getAllCategories(),
      getAllProductTags(),
    ]);

    const formOptions = {
        categories: categories.map(c => ({ value: c.id, label: c.name })),
        tags: tags.map(t => ({ value: t, label: t })),
    };

    return NextResponse.json({ sliderGroups, formOptions });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch slider groups', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const data = await request.json();
  try {
    const newSliderGroup = await createSliderGroup(data);
    revalidateTag('slider-groups');
    return NextResponse.json(newSliderGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create slider group', error: error.message }, { status: 500 });
  }
}
