import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { randomUUID } from 'crypto';

// GET all categories
export async function GET() {
  const db = getDatabase();
  try {
    const categories = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch categories', error: error.message }, { status: 500 });
  }
}

// CREATE a new category
export async function POST(request) {
  const { name, slug, image } = await request.json();
  const db = getDatabase();

  if (!name || !slug) {
    return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
  }
  
  const id = `cat-${randomUUID().slice(0, 4)}`;

  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO categories (id, name, slug, image) VALUES (?, ?, ?, ?)', [id, name, slug, image], function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return reject(new Error('A category with this slug already exists.'));
            }
            return reject(err);
        }
        resolve(this);
      });
    });
    return NextResponse.json({ message: 'Category created successfully', id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create category', error: error.message }, { status: 500 });
  }
}
