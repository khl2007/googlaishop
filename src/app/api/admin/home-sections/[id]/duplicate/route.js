
import { NextResponse } from 'next/server';
import { duplicateHomeSection } from '@/lib/data';
import { revalidateTag } from 'next/cache';

export async function POST(request, { params }) {
    const { id } = params;
    try {
        const newSection = await duplicateHomeSection(id);
        revalidateTag('home-sections');
        // The new section object is returned with its new ID
        return NextResponse.json(newSection, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to duplicate section', error: error.message }, { status: 500 });
    }
}
