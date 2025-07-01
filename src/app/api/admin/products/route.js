
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
    const { name, slug, description, shortDescription, categoryId, vendorId, variants, optionGroups, tags, isFeatured, isOnOffer, weight, dimensions, images, mainImage } = await request.json();
    const db = getDatabase();

    if (!name || !slug || !description || !categoryId || !vendorId || !variants || !variants.length) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const productId = `prod-${randomUUID().slice(0, 8)}`;

    try {
        await new Promise((resolve, reject) => db.run('BEGIN TRANSACTION', err => err ? reject(err) : resolve()));

        await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO products (id, name, slug, description, shortDescription, categoryId, vendorId, optionGroups, tags, isFeatured, isOnOffer, weight, dimensions, images, mainImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            db.run(sql, [productId, name, slug, description, shortDescription, categoryId, vendorId, optionGroups, tags, isFeatured, isOnOffer, weight, dimensions, images, mainImage], 
            function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });

        const insertVariantStmt = db.prepare('INSERT INTO product_variants (id, productId, name, price, salePrice, image, stock, options) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
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
                insertVariantStmt.run(variantId, productId, variant.name, variant.price, variant.salePrice, image, variant.stock, variant.options, function(err) {
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


// DELETE multiple products
export async function DELETE(request) {
  const { ids } = await request.json();
  const db = getDatabase();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ message: 'Product IDs must be provided as a non-empty array' }, { status: 400 });
  }

  const placeholders = ids.map(() => '?').join(',');

  try {
    await new Promise((resolve, reject) => db.run('BEGIN TRANSACTION', err => err ? reject(err) : resolve()));

    // Delete associated variants first
    await new Promise((resolve, reject) => {
      const sql = `DELETE FROM product_variants WHERE productId IN (${placeholders})`;
      db.run(sql, ids, function(err) {
        if (err) reject(err);
        resolve(this);
      });
    });

    // Delete products
    await new Promise((resolve, reject) => {
      const sql = `DELETE FROM products WHERE id IN (${placeholders})`;
      db.run(sql, ids, function(err) {
        if (err) reject(err);
        if (this.changes === 0) reject(new Error('No products found to delete.'));
        resolve(this);
      });
    });

    await new Promise((resolve, reject) => db.run('COMMIT', err => err ? reject(err) : resolve()));

    return NextResponse.json({ message: `${ids.length} products deleted successfully` });
  } catch (error) {
    await new Promise((resolve) => db.run('ROLLBACK', () => resolve()));
    return NextResponse.json({ message: 'Failed to delete products', error: error.message }, { status: 500 });
  }
}
