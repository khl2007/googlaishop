import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();

    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    const productsWithVariants = await Promise.all(products.map(async (product) => {
      const variants = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM product_variants WHERE productId = ?', [product.id], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      return { ...product, variants };
    }));

    return NextResponse.json(productsWithVariants);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
