
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

export async function getCategoryById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
            if (err) {
                return reject(new Error('Failed to fetch category.'));
            }
            resolve(row);
        });
    });
}

export async function getCategoryBySlug(slug) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM categories WHERE slug = ?', [slug], (err, row) => {
            if (err) {
                console.error('Database error in getCategoryBySlug:', err);
                return reject(new Error('Failed to fetch category.'));
            }
            resolve(row);
        });
    });
}

export async function getSubCategories(parentId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM categories WHERE parentId = ?', [parentId], (err, rows) => {
            if (err) {
                return reject(new Error('Failed to fetch sub-categories.'));
            }
            resolve(rows);
        });
    });
}


export async function getProductsByCategoryId(categoryId) {
    const db = getDatabase();
    const products = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM products WHERE categoryId = ?', [categoryId], (err, rows) => {
            if (err) reject(new Error('Failed to fetch products for the category.'));
            else resolve(rows);
        });
    });

    const productsWithVariants = await Promise.all(products.map(async (product) => {
        const variants = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM product_variants WHERE productId = ?', [product.id], (err, rows) => {
                if (err) reject(new Error('Failed to fetch variants for a product.'));
                else resolve(rows);
            });
        });
        return { ...product, variants };
    }));

    return productsWithVariants;
}


export async function getUsers() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT u.id, u.fullName, u.username, u.phoneNumber, u.country, u.city, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
        `, (err, rows) => {
            if (err) {
                console.error('Database error in getUsers:', err);
                return reject(new Error('Failed to fetch users.'));
            }
            resolve(rows);
        });
    });
}

export async function getAdminUserById(id) {
  const db = getDatabase();

  const user = await new Promise((resolve, reject) => {
    db.get(`
        SELECT u.id, u.fullName, u.username, u.phoneNumber, u.country, u.city, u.role_id, u.logo
        FROM users u
        WHERE u.id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Database error in getAdminUserById:', err);
        return reject(new Error('Failed to fetch user.'));
      }
      resolve(row);
    });
  });

  return user;
}

export async function getUserProfileById(id) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get(`
        SELECT id, fullName, username, phoneNumber, country, city
        FROM users
        WHERE id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Database error in getUserProfileById:', err);
        return reject(new Error('Failed to fetch user profile.'));
      }
      resolve(row);
    });
  });
}

export async function getRoles() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM roles', (err, rows) => {
            if (err) {
                console.error('Database error in getRoles:', err);
                return reject(new Error('Failed to fetch roles.'));
            }
            resolve(rows);
        });
    });
}

export async function getVendors() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT u.id, u.fullName 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'vendor'
            ORDER BY u.fullName
        `, (err, rows) => {
            if (err) {
                console.error('Database error in getVendors:', err);
                return reject(new Error('Failed to fetch vendors.'));
            }
            resolve(rows);
        });
    });
}


export async function getPrimaryAddressByUserId(userId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM addresses WHERE user_id = ? AND isPrimary = 1', [userId], (err, row) => {
            if (err) {
                console.error('Database error in getPrimaryAddressByUserId:', err);
                return reject(new Error('Failed to fetch address.'));
            }
            resolve(row);
        });
    });
}

export async function upsertPrimaryAddress(userId, addressData) {
    const db = getDatabase();
    const { fullName, street, apartment, city, state, zip, country } = addressData;

    const existingAddress = await getPrimaryAddressByUserId(userId);

    return new Promise((resolve, reject) => {
        if (existingAddress) {
            const sql = `UPDATE addresses SET fullName = ?, street = ?, apartment = ?, city = ?, state = ?, zip = ?, country = ? WHERE id = ?`;
            db.run(sql, [fullName, street, apartment, city, state, zip, country, existingAddress.id], function(err) {
                if (err) reject(err);
                resolve(this);
            });
        } else {
            const sql = `INSERT INTO addresses (user_id, fullName, street, apartment, city, state, zip, country, isPrimary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`;
            db.run(sql, [userId, fullName, street, apartment, city, state, zip, country], function(err) {
                if (err) reject(err);
                resolve(this);
            });
        }
    });
}

export async function getAddressesByUserId(userId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY isPrimary DESC, id DESC', [userId], (err, rows) => {
            if (err) {
                console.error('Database error in getAddressesByUserId:', err);
                return reject(new Error('Failed to fetch addresses.'));
            }
            resolve(rows);
        });
    });
}

export async function addUserAddress(userId, addressData) {
    const db = getDatabase();
    const { fullName, street, apartment, city, state, zip, country } = addressData;

    const existingAddresses = await getAddressesByUserId(userId);
    const isFirstAddress = existingAddresses.length === 0;

    const isPrimary = isFirstAddress ? 1 : 0;

    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO addresses (user_id, fullName, street, apartment, city, state, zip, country, isPrimary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [userId, fullName, street, apartment, city, state, zip, country, isPrimary], function(err) {
            if (err) return reject(err);
            
            const newAddressId = this.lastID;
            db.get('SELECT * FROM addresses WHERE id = ?', [newAddressId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    });
}

export async function updateUserAddress(addressId, userId, addressData) {
    const db = getDatabase();
    const { fullName, street, apartment, city, state, zip, country } = addressData;
    return new Promise((resolve, reject) => {
        const sql = `UPDATE addresses SET fullName = ?, street = ?, apartment = ?, city = ?, state = ?, zip = ?, country = ? WHERE id = ? AND user_id = ?`;
        db.run(sql, [fullName, street, apartment, city, state, zip, country, addressId, userId], function(err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Address not found or permission denied."));
            resolve(this);
        });
    });
}

export async function deleteUserAddress(addressId, userId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM addresses WHERE id = ? AND user_id = ?';
        db.run(sql, [addressId, userId], function(err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Address not found or permission denied."));
            resolve(this);
        });
    });
}

export async function getSettings() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
            if (err) {
                console.error('Database error in getSettings:', err);
                return reject(new Error('Failed to fetch settings.'));
            }
            resolve(row);
        });
    });
}

export async function getPaymentMethods() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM payment_methods ORDER BY id', (err, rows) => {
            if (err) {
                console.error('Database error in getPaymentMethods:', err);
                return reject(new Error('Failed to fetch payment methods.'));
            }
            // Parse config JSON string into an object
            const methods = rows.map(row => ({
                ...row,
                config: row.config ? JSON.parse(row.config) : {},
            }));
            resolve(methods);
        });
    });
}

export async function getEnabledPaymentMethods() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM payment_methods WHERE enabled = 1 ORDER BY id', (err, rows) => {
            if (err) {
                console.error('Database error in getEnabledPaymentMethods:', err);
                return reject(new Error('Failed to fetch payment methods.'));
            }
            const methods = rows.map(row => ({
                ...row,
                config: row.config ? JSON.parse(row.config) : {},
            }));
            resolve(methods);
        });
    });
}

export async function updatePaymentMethods(methods) {
    const db = getDatabase();
    const sql = `UPDATE payment_methods SET enabled = ?, config = ? WHERE provider = ?`;
    const stmt = db.prepare(sql);

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject(err);
            });

            methods.forEach(method => {
                stmt.run(method.enabled, JSON.stringify(method.config), method.provider, function (err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                });
            });
            stmt.finalize();

            db.run("COMMIT", (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}
