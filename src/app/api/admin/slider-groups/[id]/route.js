import { NextResponse } from 'next/server';
import { getSliderGroupById, updateSliderGroup, deleteSliderGroup } from '@/lib/data';
import { revalidateTag } from 'next/cache';

export async function GET(request, { params }) {
    const { id } = params;
    try {
        const sliderGroup = await getSliderGroupById(id);
        if (!sliderGroup) {
            return NextResponse.json({ message: 'Slider group not found' }, { status: 404 });
        }
        return NextResponse.json(sliderGroup);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch slider group', error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = params;
    const data = await request.json();
    try {
        await updateSliderGroup(id, data);
        revalidateTag('slider-groups');
        return NextResponse.json({ message: 'Slider group updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update slider group', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        await deleteSliderGroup(id);
        revalidateTag('slider-groups');
        return NextResponse.json({ message: 'Slider group deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete slider group', error: error.message }, { status: 500 });
    }
}
