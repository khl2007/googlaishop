import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';

export async function GET(request, { params }) {
  const slug = params.slug;
  const db = getDatabase();

  try {
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE slug = ?', [slug], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!product) {
      db.close();
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const variants = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM product_variants WHERE productId = ?', [product.id], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    product.variants = variants;

    db.close();
    return NextResponse.json(product);
  } catch (error) {
    console.error('Database error:', error);
    db.close();
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}