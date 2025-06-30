import { NextResponse } from 'next/server';
import { getAllSlides, createSlide } from '@/lib/data';

export async function GET() {
  try {
    const slides = await getAllSlides();
    return NextResponse.json(slides);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch slides', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const data = await request.json();
  try {
    const newSlide = await createSlide(data);
    return NextResponse.json({ message: 'Slide created successfully', id: newSlide.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create slide', error: error.message }, { status: 500 });
  }
}
