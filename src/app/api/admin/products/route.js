import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { getAllProducts } from '@/lib/data';
import { randomUUID } from 'crypto';

// GET all products
export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
  }
}

// CREATE a new product
export async function POST(request) {
    const { name, slug, description, categoryId, variants, optionGroups } = await request.json();
    const db = getDatabase();

    if (!name || !slug || !description || !categoryId || !variants || !variants.length) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const productId = `prod-${randomUUID().slice(0, 8)}`;

    try {
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO products (id, name, slug, description, categoryId, optionGroups) VALUES (?, ?, ?, ?, ?, ?)', 
            [productId, name, slug, description, categoryId, optionGroups], 
            function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });

        const insertVariantStmt = db.prepare('INSERT INTO product_variants (id, productId, name, price, image, stock, color_hex) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const variant of variants) {
            const variantId = `var-${randomUUID().slice(0, 8)}`;
            await new Promise((resolve, reject) => {
                insertVariantStmt.run(variantId, productId, variant.name, variant.price, variant.image, variant.stock, variant.color_hex, function(err) {
                    if (err) return reject(err);
                    resolve(this);
                });
            });
        }
        insertVariantStmt.finalize();

        return NextResponse.json({ message: 'Product created successfully', id: productId }, { status: 201 });
    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json({ message: 'Failed to create product', error: error.message }, { status: 500 });
    }
}
