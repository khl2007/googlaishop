import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password, fullName, role, phoneNumber, country, city } = await request.json();

    if (!email || !password || !fullName || !role || !phoneNumber || !country || !city) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }
    
    const db = getDatabase();

    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ?', [email], (err, row) => {
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

    const roleRecord = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM roles WHERE name = ?', [role], (err, row) => {
            if (err) reject(new Error('Database error during role check.'));
            else resolve(row);
        });
    });

    if (!roleRecord) {
        return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (username, password, fullName, role_id, phoneNumber, country, city) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const params = [email, hashedPassword, fullName, roleRecord.id, phoneNumber, country, city];
      db.run(sql, params, function (err) {
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
