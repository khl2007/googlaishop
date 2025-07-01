
import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const db = getDatabase();

    const userRow = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.id, u.username, u.password, u.fullName, r.name as role, u.isVerified
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.username = ?
      `;
      db.get(sql, [email], (err, row) => {
        if (err) {
          console.error('Database error:', err);
          reject(new Error('Database error'));
        } else {
          resolve(row);
        }
      });
    });

    if (!userRow) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, userRow.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = userRow;
    userWithoutPassword.isVerified = !!userRow.isVerified;

    const response = NextResponse.json({ user: userWithoutPassword }, { status: 200 });

    response.cookies.set('user_session', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'none',
    });
    
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
