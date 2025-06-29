import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const db = getDatabase();

    // Promisify db.get to use with async/await
    const user = await new Promise((resolve, reject) => {
      // The DB schema uses 'username', but the form uses 'email' for the same field.
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

    // Exclude password hash from the response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({ user: userWithoutPassword }, { status: 200 });

    // Set a simple cookie for the middleware to check for authentication
    response.cookies.set('admin_token', 'true', {
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
