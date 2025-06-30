import { NextResponse } from 'next/server';
import { getAreasByCityId, addArea } from '@/lib/data';

export async function GET(request, { params }) {
  const { cityId } = params;

  if (!cityId) {
    return NextResponse.json({ message: 'City ID parameter is required' }, { status: 400 });
  }

  try {
    const areas = await getAreasByCityId(cityId);
    return NextResponse.json(areas);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch areas', error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { cityId } = params;
  const { name } = await request.json();

  if (!name || !cityId) {
    return NextResponse.json({ message: 'Name and cityId are required' }, { status: 400 });
  }

  try {
    const newArea = await addArea(name, cityId);
    return NextResponse.json({ message: 'Area created successfully', area: newArea }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create area', error: error.message }, { status: 500 });
  }
}
