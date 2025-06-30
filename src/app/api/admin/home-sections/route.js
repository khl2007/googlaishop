
import { NextResponse } from 'next/server';
import { getAllHomeSections, createHomeSection, updateHomeSectionsOrder, getAllCategories, getAllProductTags, getAllProducts } from '@/lib/data';
import { revalidateTag } from 'next/cache';

export async function GET() {
  try {
    const sections = await getAllHomeSections();
    // Also fetch data needed for the form
    const [categories, tags, products] = await Promise.all([
      getAllCategories(),
      getAllProductTags(),
      getAllProducts(),
    ]);

    return NextResponse.json({
        sections,
        formOptions: {
            categories: categories.map(c => ({ value: c.id, label: c.name })),
            tags: tags.map(t => ({ value: t, label: t })),
            products: products.map(p => ({ value: p.id, label: p.name })),
        }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch home sections', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const data = await request.json();
  try {
    const newSection = await createHomeSection(data);
    revalidateTag('home-sections');
    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create section', error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
    const { orderedIds } = await request.json();
    if (!orderedIds || !Array.isArray(orderedIds)) {
        return NextResponse.json({ message: '`orderedIds` must be an array.' }, { status: 400 });
    }
    try {
        await updateHomeSectionsOrder(orderedIds);
        revalidateTag('home-sections');
        return NextResponse.json({ message: 'Sections reordered successfully.' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to reorder sections.', error: error.message }, { status: 500 });
    }
}
