
import getDatabase from '@/lib/database';
import { unstable_cache as cache } from 'next/cache';

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
    const { fullName, street, apartment, city, area, state, zip, country } = addressData;

    const existingAddress = await getPrimaryAddressByUserId(userId);

    return new Promise((resolve, reject) => {
        if (existingAddress) {
            const sql = `UPDATE addresses SET fullName = ?, street = ?, apartment = ?, city = ?, area = ?, state = ?, zip = ?, country = ? WHERE id = ?`;
            db.run(sql, [fullName, street, apartment, city, area, state, zip, country, existingAddress.id], function(err) {
                if (err) reject(err);
                resolve(this);
            });
        } else {
            const sql = `INSERT INTO addresses (user_id, fullName, street, apartment, city, area, state, zip, country, isPrimary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;
            db.run(sql, [userId, fullName, street, apartment, city, area, state, zip, country], function(err) {
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
    const { fullName, street, apartment, city, area, state, zip, country } = addressData;

    const existingAddresses = await getAddressesByUserId(userId);
    const isFirstAddress = existingAddresses.length === 0;

    const isPrimary = isFirstAddress ? 1 : 0;

    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO addresses (user_id, fullName, street, apartment, city, area, state, zip, country, isPrimary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [userId, fullName, street, apartment, city, area, state, zip, country, isPrimary], function(err) {
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
    const { fullName, street, apartment, city, area, state, zip, country } = addressData;
    return new Promise((resolve, reject) => {
        const sql = `UPDATE addresses SET fullName = ?, street = ?, apartment = ?, city = ?, area = ?, state = ?, zip = ?, country = ? WHERE id = ? AND user_id = ?`;
        db.run(sql, [fullName, street, apartment, city, area, state, zip, country, addressId, userId], function(err) {
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

export const getSettings = cache(async () => {
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
}, 
['settings'],
{ tags: ['settings'] }
);

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

export async function getCountriesWithCityCount() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT country_name, COUNT(id) as city_count
            FROM cities
            GROUP BY country_name
            ORDER BY country_name
        `;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error('Database error in getCountriesWithCityCount:', err);
                return reject(new Error('Failed to fetch country city counts.'));
            }
            resolve(rows);
        });
    });
}

export async function getCitiesByCountry(countryName) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM cities WHERE country_name = ? ORDER BY name`;
        db.all(sql, [countryName], (err, rows) => {
            if (err) {
                console.error('Database error in getCitiesByCountry:', err);
                return reject(new Error('Failed to fetch cities.'));
            }
            resolve(rows);
        });
    });
}

export async function getCityById(cityId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM cities WHERE id = ?`;
        db.get(sql, [cityId], (err, row) => {
            if (err) {
                console.error('Database error in getCityById:', err);
                return reject(new Error('Failed to fetch city.'));
            }
            resolve(row);
        });
    });
}


export async function addCity(name, country_name) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO cities (name, country_name) VALUES (?, ?)';
        db.run(sql, [name, country_name], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return reject(new Error('This city already exists for this country.'));
                }
                return reject(err);
            }
            resolve({ id: this.lastID, name, country_name });
        });
    });
}

export async function updateCity(id, name) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE cities SET name = ? WHERE id = ?';
        db.run(sql, [name, id], function(err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("City not found."));
            resolve(this);
        });
    });
}

export async function deleteCity(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM cities WHERE id = ?';
        db.run(sql, [id], function(err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("City not found."));
            resolve(this);
        });
    });
}

export async function getAreasByCityId(cityId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM areas WHERE city_id = ? ORDER BY name`;
        db.all(sql, [cityId], (err, rows) => {
            if (err) {
                console.error('Database error in getAreasByCityId:', err);
                return reject(new Error('Failed to fetch areas.'));
            }
            resolve(rows);
        });
    });
}

export async function addArea(name, cityId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO areas (name, city_id) VALUES (?, ?)';
        db.run(sql, [name, cityId], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return reject(new Error('This area already exists for this city.'));
                }
                return reject(err);
            }
            resolve({ id: this.lastID, name, city_id: cityId });
        });
    });
}

export async function updateArea(id, name) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE areas SET name = ? WHERE id = ?';
        db.run(sql, [name, id], function(err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Area not found."));
            resolve(this);
        });
    });
}

export async function deleteArea(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM areas WHERE id = ?';
        db.run(sql, [id], function(err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Area not found."));
            resolve(this);
        });
    });
}

// Shipping Methods
export async function getShippingMethods() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM shipping_methods ORDER BY id', (err, rows) => {
            if (err) {
                console.error('Database error in getShippingMethods:', err);
                return reject(new Error('Failed to fetch shipping methods.'));
            }
            resolve(rows.map(row => ({ ...row, enabled: !!row.enabled })));
        });
    });
}

export async function getShippingMethodById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM shipping_methods WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Database error in getShippingMethodById:', err);
                return reject(new Error('Failed to fetch shipping method.'));
            }
            resolve(row ? { ...row, enabled: !!row.enabled } : null);
        });
    });
}

export async function getAllCitiesWithCountry() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT id, name, country_name FROM cities ORDER BY country_name, name', (err, rows) => {
            if (err) {
                console.error('Database error in getAllCitiesWithCountry:', err);
                return reject(new Error('Failed to fetch cities.'));
            }
            resolve(rows);
        });
    });
}

export async function getAllAreasWithCity() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT a.id, a.name, c.name as city_name, c.country_name 
            FROM areas a
            JOIN cities c ON a.city_id = c.id
            ORDER BY c.country_name, c.name, a.name
        `, (err, rows) => {
            if (err) {
                console.error('Database error in getAllAreasWithCity:', err);
                return reject(new Error('Failed to fetch areas.'));
            }
            resolve(rows);
        });
    });
}

export async function getCityByNameAndCountry(cityName, countryName) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM cities WHERE name = ? AND country_name = ?`;
        db.get(sql, [cityName, countryName], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
}

export async function getAreaByNameAndCity(areaName, cityId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM areas WHERE name = ? AND city_id = ?`;
        db.get(sql, [areaName, cityId], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
}

export async function getProductWeights(productIds) {
    if (!productIds || productIds.length === 0) {
        return [];
    }
    const db = getDatabase();
    const placeholders = productIds.map(() => '?').join(',');
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, weight FROM products WHERE id IN (${placeholders})`;
        db.all(sql, productIds, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

// Slide Management
export async function getAllSlides() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM slides ORDER BY "order" ASC', (err, rows) => {
            if (err) {
                console.error('Database error in getAllSlides:', err);
                return reject(new Error('Failed to fetch slides.'));
            }
            resolve(rows.map(row => ({ ...row, isActive: !!row.isActive })));
        });
    });
}

export async function getActiveSlides() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM slides WHERE isActive = 1 ORDER BY "order" ASC', (err, rows) => {
            if (err) {
                console.error('Database error in getActiveSlides:', err);
                return reject(new Error('Failed to fetch active slides.'));
            }
            resolve(rows.map(row => ({ ...row, isActive: !!row.isActive })));
        });
    });
}

export async function getSlideById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM slides WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Database error in getSlideById:', err);
                return reject(new Error('Failed to fetch slide.'));
            }
            resolve(row ? { ...row, isActive: !!row.isActive } : null);
        });
    });
}

export async function createSlide(data) {
    const db = getDatabase();
    const { title, description, image, link, buttonText, isActive, order } = data;
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO slides (title, description, image, link, buttonText, isActive, "order") VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [title, description, image, link, buttonText, isActive ? 1 : 0, order], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID });
        });
    });
}

export async function updateSlide(id, data) {
    const db = getDatabase();
    const { title, description, image, link, buttonText, isActive, order } = data;
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE slides SET title = ?, description = ?, image = ?, link = ?, buttonText = ?, isActive = ?, "order" = ? WHERE id = ?';
        db.run(sql, [title, description, image, link, buttonText, isActive ? 1 : 0, order, id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Slide not found or no changes made."));
            resolve(this);
        });
    });
}

export async function deleteSlide(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM slides WHERE id = ?', [id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Slide not found."));
            resolve(this);
        });
    });
}

// Home Page Sections
export async function getAllHomeSections() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM home_sections ORDER BY "order" ASC', (err, rows) => {
            if (err) return reject(new Error('Failed to fetch home sections.'));
            resolve(rows.map(row => ({ ...row, isActive: !!row.isActive })));
        });
    });
}

export async function getActiveHomeSections() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM home_sections WHERE isActive = 1 ORDER BY "order" ASC', (err, rows) => {
            if (err) return reject(new Error('Failed to fetch active home sections.'));
            resolve(rows.map(row => ({
                ...row,
                isActive: !!row.isActive,
                config: row.config ? JSON.parse(row.config) : null
            })));
        });
    });
}

export async function createHomeSection(data) {
    const db = getDatabase();
    const { title, type, config, style, order, isActive } = data;
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO home_sections (title, type, config, style, "order", isActive) VALUES (?, ?, ?, ?, ?, ?)';
        db.run(sql, [title, type, config, style, order, isActive ? 1 : 0], function (err) {
            if (err) return reject(err);
            db.get('SELECT * FROM home_sections WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err)
                else resolve(row);
            });
        });
    });
}

export async function updateHomeSection(id, data) {
    const db = getDatabase();
    const { title, type, config, style, isActive } = data;
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE home_sections SET title = ?, type = ?, config = ?, style = ?, isActive = ? WHERE id = ?';
        db.run(sql, [title, type, config, style, isActive ? 1 : 0, id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Section not found or no changes made."));
            resolve(this);
        });
    });
}

export async function updateHomeSectionsOrder(orderedIds) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION", err => { if (err) reject(err) });
            const stmt = db.prepare("UPDATE home_sections SET \"order\" = ? WHERE id = ?");
            orderedIds.forEach((id, index) => {
                stmt.run(index + 1, id, err => { if(err) reject(err) });
            });
            stmt.finalize(err => {
                if (err) {
                    db.run("ROLLBACK", () => reject(err));
                } else {
                    db.run("COMMIT", err => {
                        if (err) reject(err);
                        else resolve();
                    });
                }
            });
        });
    });
}

export async function deleteHomeSection(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM home_sections WHERE id = ?', [id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error("Section not found."));
            resolve(this);
        });
    });
}

export async function getAllProductTags() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
        db.all('SELECT tags FROM products WHERE tags IS NOT NULL AND tags != ""', (err, rows) => {
            if (err) return reject(new Error('Failed to fetch tags.'));
            const allTags = new Set();
            rows.forEach(row => {
                row.tags.split(',').forEach(tag => {
                    const trimmedTag = tag.trim();
                    if (trimmedTag) allTags.add(trimmedTag);
                });
            });
            resolve(Array.from(allTags));
        });
    });
}

export async function getProductsForSection(section) {
    const allProducts = await getAllProducts();
    if (!section.type) return [];

    try {
        switch (section.type) {
            case 'featured':
                return allProducts.filter(p => p.isFeatured);
            case 'on_offer':
                return allProducts.filter(p => p.isOnOffer);
            case 'category': {
                const categoryIds = section.config;
                return allProducts.filter(p => categoryIds.includes(p.categoryId));
            }
            case 'tag': {
                const tags = section.config;
                return allProducts.filter(p => p.tags && tags.some(tag => p.tags.split(',').map(t=>t.trim()).includes(tag)));
            }
            case 'custom': {
                const productIds = section.config;
                 const productMap = new Map(allProducts.map(p => [p.id, p]));
                 return productIds.map(id => productMap.get(id)).filter(Boolean);
            }
            case 'ai':
                // AI logic placeholder
                return allProducts.slice(0, 4);
            default:
                return [];
        }
    } catch (e) {
        console.error(`Failed to get products for section ${section.id}`, e);
        return [];
    }
}
