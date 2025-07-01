
import { NextResponse } from 'next/server';
import { findUserByTokenAndVerify } from '@/lib/data';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ message: 'Verification token is missing.' }, { status: 400 });
    }

    try {
        await findUserByTokenAndVerify(token);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('verified', 'true');
        return NextResponse.redirect(loginUrl);
    } catch (error) {
        // In a real app, you might want a more user-friendly error page.
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'verification_failed');
        return NextResponse.redirect(loginUrl);
    }
}
