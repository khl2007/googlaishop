import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const db = getDatabase();

    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [email], (err, row) => {
        if (err) {
          console.error('Database error:', err);
          reject(new Error('Database error'));
        } else {
          resolve(row);
        }
      });
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({ user: userWithoutPassword }, { status: 200 });

    response.cookies.set('user_session', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
