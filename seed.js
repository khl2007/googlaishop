const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');
const { allCategories, allProducts } = require('/home/user/studio/src/lib/mock-data.js');

const db = new sqlite3.Database('/home/user/studio/database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database.');
    seedDatabase();
  }
});

function seedDatabase() {
  db.serialize(() => {
    // Seed Admin User
    const saltRounds = 10;
    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminpassword';
    const adminFullName = 'Admin User';
    const hashedPassword = bcrypt.hashSync(adminPassword, saltRounds);

    const insertAdminStmt = db.prepare("INSERT OR IGNORE INTO users (username, password, fullName, role) VALUES (?, ?, ?, ?)");
    insertAdminStmt.run(adminEmail, hashedPassword, adminFullName, 'admin', (err) => {
      if (err) {
        console.error('Error inserting admin user:', err.message);
      }
    });
    insertAdminStmt.finalize();
    console.log('Admin user seeding attempted.');


    // Insert categories
    const insertCategoryStmt = db.prepare('INSERT OR IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)');
    allCategories.forEach((category) => {
      insertCategoryStmt.run(category.id, category.name, category.slug, (err) => {
        if (err) {
          console.error(`Error inserting category ${category.name}:`, err.message);
        }
      });
    });
    insertCategoryStmt.finalize();
    console.log('Categories seeded.');

    // Insert products
    const insertProductStmt = db.prepare('INSERT OR IGNORE INTO products (id, name, slug, description, categoryId) VALUES (?, ?, ?, ?, ?)');
    allProducts.forEach((product) => {
      insertProductStmt.run(product.id, product.name, product.slug, product.description, product.categoryId, (err) => {
        if (err) {
          console.error(`Error inserting product ${product.name}:`, err.message);
        }
      });

      // Insert product variants
      const insertVariantStmt = db.prepare('INSERT OR IGNORE INTO product_variants (id, productId, name, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)');
      product.variants.forEach((variant) => {
        insertVariantStmt.run(variant.id, product.id, variant.name, variant.price, variant.image, variant.stock, (err) => {
          if (err) {
            console.error(`Error inserting variant ${variant.name} for product ${product.name}:`, err.message);
          }
        });
      });
      insertVariantStmt.finalize();
    });
    insertProductStmt.finalize();
    console.log('Products and variants seeded.');

    db.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
}
