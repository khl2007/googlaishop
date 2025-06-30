import { NextResponse } from 'next/server';
import { getSlideById, updateSlide, deleteSlide } from '@/lib/data';

export async function GET(request, { params }) {
    const { id } = params;
    try {
        const slide = await getSlideById(id);
        if (!slide) {
            return NextResponse.json({ message: 'Slide not found' }, { status: 404 });
        }
        return NextResponse.json(slide);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch slide', error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = params;
    const data = await request.json();
    try {
        await updateSlide(id, data);
        return NextResponse.json({ message: 'Slide updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update slide', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        await deleteSlide(id);
        return NextResponse.json({ message: 'Slide deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete slide', error: error.message }, { status: 500 });
    }
}
