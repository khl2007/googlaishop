import { NextResponse } from 'next/server';
import { updateHomeSection, deleteHomeSection } from '@/lib/data';

export async function PUT(request, { params }) {
    const { id } = params;
    const data = await request.json();
    try {
        await updateHomeSection(id, data);
        return NextResponse.json({ message: 'Section updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update section', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        await deleteHomeSection(id);
        return NextResponse.json({ message: 'Section deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete section', error: error.message }, { status: 500 });
    }
}
