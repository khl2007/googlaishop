import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    // The UI uses 'email', so we'll use that as the username for consistency.
    const username = email;
    const db = getDatabase();

    // Check if user already exists
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

    // Insert new user
    await new Promise((resolve, reject) => {
      // The 'users' table only has username and password columns. 'fullName' from the form is ignored.
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
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
