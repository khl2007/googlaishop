
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().set({
    name: 'user_session',
    value: '',
    httpOnly: true,
    secure: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'none',
  });
  return NextResponse.json({ message: 'Logged out successfully' });
}
