
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
    const { name, slug, description, categoryId, vendorId, variants, optionGroups } = await request.json();
    const db = getDatabase();

    if (!name || !slug || !description || !categoryId || !vendorId || !variants || !variants.length) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const productId = `prod-${randomUUID().slice(0, 8)}`;

    try {
        await new Promise((resolve, reject) => db.run('BEGIN TRANSACTION', err => err ? reject(err) : resolve()));

        await new Promise((resolve, reject) => {
            db.run('INSERT INTO products (id, name, slug, description, categoryId, vendorId, optionGroups) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [productId, name, slug, description, categoryId, vendorId, optionGroups], 
            function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });

        const insertVariantStmt = db.prepare('INSERT INTO product_variants (id, productId, name, price, image, stock, options) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const variant of variants) {
            const variantId = `var-${randomUUID().slice(0, 8)}`;
            
            const parsedOptionGroups = optionGroups ? JSON.parse(optionGroups) : [];
            let image = variant.image;
            if (!image && variant.options) {
                const variantOptions = typeof variant.options === 'string' ? JSON.parse(variant.options) : variant.options;
                for (const group of parsedOptionGroups) {
                    const selectedOptionValue = variantOptions[group.name];
                    const option = group.options.find(o => o.value === selectedOptionValue);
                    if (option && option.image) {
                        image = option.image;
                        break;
                    }
                }
            }
            if (!image) image = "https://placehold.co/600x600.png"


            await new Promise((resolve, reject) => {
                insertVariantStmt.run(variantId, productId, variant.name, variant.price, image, variant.stock, variant.options, function(err) {
                    if (err) return reject(err);
                    resolve(this);
                });
            });
        }
        insertVariantStmt.finalize();

        await new Promise((resolve, reject) => db.run('COMMIT', err => err ? reject(err) : resolve()));

        return NextResponse.json({ message: 'Product created successfully', id: productId }, { status: 201 });
    } catch (error) {
        await new Promise((resolve) => db.run('ROLLBACK', () => resolve()));
        console.error("Product creation error:", error);
        return NextResponse.json({ message: 'Failed to create product', error: error.message }, { status: 500 });
    }
}
