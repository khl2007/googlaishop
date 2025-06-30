import { NextResponse } from 'next/server';
import { updateArea, deleteArea } from '@/lib/data';

export async function PUT(request, { params }) {
  const { id } = params;
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }

  try {
    await updateArea(id, name);
    return NextResponse.json({ message: 'Area updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update area', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await deleteArea(id);
    return NextResponse.json({ message: 'Area deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete area', error: error.message }, { status: 500 });
  }
}
