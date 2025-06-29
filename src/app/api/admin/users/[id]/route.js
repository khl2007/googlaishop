import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import bcrypt from 'bcrypt';

// GET a single user
export async function GET(request, { params }) {
  const { id } = params;
  const db = getDatabase();
  try {
    const user = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.id, u.username, u.fullName, u.phoneNumber, u.country, u.city, r.id as role_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `;
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch user', error: error.message }, { status: 500 });
  }
}

// UPDATE a user
export async function PUT(request, { params }) {
    const { id } = params;
    const { fullName, username, role_id, phoneNumber, country, city, password } = await request.json();
    const db = getDatabase();

    if (!fullName || !username || !role_id || !phoneNumber || !country || !city) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        if (password) {
            // If password is provided, hash it and update
            const hashedPassword = await bcrypt.hash(password, 10);
            await new Promise((resolve, reject) => {
                const sql = 'UPDATE users SET fullName = ?, username = ?, role_id = ?, phoneNumber = ?, country = ?, city = ?, password = ? WHERE id = ?';
                db.run(sql, [fullName, username, role_id, phoneNumber, country, city, hashedPassword, id], function (err) {
                    if (err) reject(err);
                    if (this.changes === 0) reject(new Error('User not found'));
                    resolve(this);
                });
            });
        } else {
            // If no password, update other fields
            await new Promise((resolve, reject) => {
                const sql = 'UPDATE users SET fullName = ?, username = ?, role_id = ?, phoneNumber = ?, country = ?, city = ? WHERE id = ?';
                db.run(sql, [fullName, username, role_id, phoneNumber, country, city, id], function (err) {
                    if (err) reject(err);
                    if (this.changes === 0) reject(new Error('User not found'));
                    resolve(this);
                });
            });
        }
        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update user', error: error.message }, { status: 500 });
    }
}


// DELETE a user
export async function DELETE(request, { params }) {
  const { id } = params;
  const db = getDatabase();
  try {
    // Optional: Add logic to prevent deleting the main admin user, etc.
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('User not found'));
        resolve(this);
      });
    });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete user', error: error.message }, { status: 500 });
  }
}
