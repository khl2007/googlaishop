import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.get('SELECT id, username FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) { // Handle database errors
          console.error('Database error:', err);
          db.close();
          resolve(NextResponse.json({ message: 'Database error' }, { status: 500 }));
          return;
        }

        if (row) {
          // Compare provided password with the hashed password in the database
          const passwordMatch = await bcrypt.compare(password, row.password);
          db.close();
          if (passwordMatch) {
            // In a real application, you would generate a token here
            const user = { id: row.id, username: row.username }; // Exclude password
            resolve(NextResponse.json({ user }, { status: 200 }));
          } else {
            resolve(NextResponse.json({ message: 'Invalid credentials' }, { status: 401 }));
          }
        } else {
          db.close();
          resolve(NextResponse.json({ message: 'Invalid credentials' }, { status: 401 }));
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}