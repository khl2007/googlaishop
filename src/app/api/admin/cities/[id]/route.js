import { NextResponse } from 'next/server';
import { updateCity, deleteCity, getCityById } from '@/lib/data';

// GET a single city
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const city = await getCityById(id);
    if (!city) {
      return NextResponse.json({ message: 'City not found' }, { status: 404 });
    }
    return NextResponse.json(city);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch city', error: error.message }, { status: 500 });
  }
}


// UPDATE a city
export async function PUT(request, { params }) {
  const { id } = params;
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }

  try {
    await updateCity(id, name);
    return NextResponse.json({ message: 'City updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update city', error: error.message }, { status: 500 });
  }
}

// DELETE a city
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await deleteCity(id);
    return NextResponse.json({ message: 'City and its areas deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete city', error: error.message }, { status: 500 });
  }
}
