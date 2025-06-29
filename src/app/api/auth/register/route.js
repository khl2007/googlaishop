import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password, fullName, role } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }
    
    const validRoles = ['customer', 'vendor', 'admin', 'delivery_boy'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }

    const username = email;
    const db = getDatabase();

    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(new Error('Database error during user check.'));
        } else {
          resolve(row);
        }
      });
    });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, password, fullName, role) VALUES (?, ?, ?, ?)', [username, hashedPassword, fullName, role], function (err) {
        if (err) {
          reject(new Error('Database error during user insertion.'));
        } else {
          resolve(this.lastID);
        }
      });
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
