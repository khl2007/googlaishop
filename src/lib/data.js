import getDatabase from '@/lib/database';

export async function getProductBySlug(slug) {
  const db = getDatabase();

  const product = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE slug = ?', [slug], (err, row) => {
      if (err) {
        console.error('Database error in getProductBySlug (product):', err);
        return reject(new Error('Failed to fetch product.'));
      }
      resolve(row);
    });
  });

  if (!product) {
    return null;
  }

  const variants = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM product_variants WHERE productId = ?', [product.id], (err, rows) => {
      if (err) {
        console.error('Database error in getProductBySlug (variants):', err);
        return reject(new Error('Failed to fetch variants.'));
      }
      resolve(rows);
    });
  });

  product.variants = variants;
  return product;
}

export async function getProductById(id) {
  const db = getDatabase();

  const product = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error in getProductById (product):', err);
        return reject(new Error('Failed to fetch product.'));
      }
      resolve(row);
    });
  });

  if (!product) {
    return null;
  }

  const variants = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM product_variants WHERE productId = ?', [product.id], (err, rows) => {
      if (err) {
        console.error('Database error in getProductById (variants):', err);
        return reject(new Error('Failed to fetch variants.'));
      }
      resolve(rows);
    });
  });

  product.variants = variants;
  return product;
}

export async function getAllProducts() {
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

    return productsWithVariants;
}

export async function getAllCategories() {
    const db = getDatabase();

    const categories = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM categories', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
    return categories;
}
