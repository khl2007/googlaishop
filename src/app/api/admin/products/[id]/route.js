import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// GET a single product
export async function GET(request, { params }) {
  const { id } = params;
  const db = getDatabase();
  try {
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    // Note: Variant fetching could be added here if needed for the edit form.
    // For now, we are only editing the main product details.
    product.variants = [];
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch product', error: error.message }, { status: 500 });
  }
}

// UPDATE a product
export async function PUT(request, { params }) {
  const { id } = params;
   const { name, slug, description, categoryId, variants, optionGroups } = await request.json();
  const db = getDatabase();

  if (!name || !slug || !description || !categoryId) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  try {
    await new Promise((resolve, reject) => {
      db.run('UPDATE products SET name = ?, slug = ?, description = ?, categoryId = ?, optionGroups = ? WHERE id = ?', 
      [name, slug, description, categoryId, optionGroups, id], function (err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('Product not found'));
        resolve(this);
      });
    });
    // In edit mode, we are not updating variants for simplicity now.
    // A more complex implementation could handle variant updates.
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update product', error: error.message }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(request, { params }) {
  const { id } = params;
  const db = getDatabase();
  try {
    // We need to delete variants first due to foreign key constraints.
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM product_variants WHERE productId = ?', [id], function (err) {
        if (err) reject(err);
        resolve(this);
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('Product not found'));
        resolve(this);
      });
    });

    return NextResponse.json({ message: 'Product and its variants deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete product', error: error.message }, { status: 500 });
  }
}
