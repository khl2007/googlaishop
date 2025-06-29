import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

// GET all users
export async function GET() {
  const db = getDatabase();
  try {
    const users = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.id, u.fullName, u.username, r.name as role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.fullName
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch users', error: error.message }, { status: 500 });
  }
}

// CREATE a new user
export async function POST(request) {
  const { fullName, username, password, role_id, phoneNumber, country, city } = await request.json();
  const db = getDatabase();

  if (!fullName || !username || !password || !role_id || !phoneNumber || !country || !city) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (fullName, username, password, role_id, phoneNumber, country, city) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.run(sql, [fullName, username, hashedPassword, role_id, phoneNumber, country, city], function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return reject(new Error('A user with this email already exists.'));
            }
            return reject(err);
        }
        resolve({ id: this.lastID });
      });
    });
    return NextResponse.json({ message: 'User created successfully', id: result.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create user', error: error.message }, { status: 500 });
  }
}
