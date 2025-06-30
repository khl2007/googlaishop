import { NextResponse } from 'next/server';
import { getActiveSlides } from '@/lib/data';

export async function GET() {
  try {
    const slides = await getActiveSlides();
    return NextResponse.json(slides);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch slides', error: error.message }, { status: 500 });
  }
}
