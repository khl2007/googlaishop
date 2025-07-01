
import { NextResponse } from 'next/server';
import { toggleUserVerification } from '@/lib/data';

export async function PUT(request, { params }) {
    const { id } = params;
    const { isVerified } = await request.json();

    if (typeof isVerified !== 'boolean') {
        return NextResponse.json({ message: 'isVerified must be a boolean' }, { status: 400 });
    }

    try {
        await toggleUserVerification(id, isVerified);
        return NextResponse.json({ message: 'User verification status updated.' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
