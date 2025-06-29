import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// GET a single category
export async function GET(request, { params }) {
  const { id } = params;
  const db = getDatabase();
  try {
    const category = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch category', error: error.message }, { status: 500 });
  }
}

// UPDATE a category
export async function PUT(request, { params }) {
  const { id } = params;
  const { name, slug } = await request.json();
  const db = getDatabase();

  if (!name || !slug) {
    return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
  }

  try {
    await new Promise((resolve, reject) => {
      db.run('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, id], function (err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('Category not found'));
        resolve(this);
      });
    });
    return NextResponse.json({ message: 'Category updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update category', error: error.message }, { status: 500 });
  }
}

// DELETE a category
export async function DELETE(request, { params }) {
  const { id } = params;
  const db = getDatabase();
  try {
    // Check if any products are using this category
    const product = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM products WHERE categoryId = ? LIMIT 1', [id], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });

    if (product) {
        return NextResponse.json({ message: 'Cannot delete category with associated products' }, { status: 400 });
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('Category not found'));
        resolve(this);
      });
    });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete category', error: error.message }, { status: 500 });
  }
}
