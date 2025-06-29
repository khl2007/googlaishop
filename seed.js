const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');
const { allCategories, allProducts } = require('./src/lib/mock-data.js');

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database.');
    seedDatabase();
  }
});

function seedDatabase() {
  const roles = ['admin', 'vendor', 'customer', 'delivery'];
  const permissions = [
    { action: 'manage', subject: 'all' }, // Admin
    { action: 'manage', subject: 'products' }, // Vendor
    { action: 'read', subject: 'orders' }, // Vendor, Delivery
    { action: 'update', subject: 'orders' }, // Vendor, Delivery
    { action: 'create', subject: 'orders' }, // Customer
    { action: 'read', subject: 'products' }, // Customer
    { action: 'read', subject: 'categories' }, // Customer
  ];

  const rolePermissions = {
    admin: ['manage:all'],
    vendor: ['manage:products', 'read:orders', 'update:orders'],
    customer: ['create:orders', 'read:products', 'read:categories'],
    delivery: ['read:orders', 'update:orders'],
  };

  db.serialize(() => {
    // Create tables if they don't exist
 db.run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT UNIQUE
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS permissions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
 subject TEXT,
 UNIQUE(action, subject)
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS role_permissions (
 role_id INTEGER,
 permission_id INTEGER,
 FOREIGN KEY(role_id) REFERENCES roles(id),
 FOREIGN KEY(permission_id) REFERENCES permissions(id),
 UNIQUE(role_id, permission_id)
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      fullName TEXT,
      role_id INTEGER,
 phoneNumber TEXT,
 country TEXT,
 city TEXT,
 FOREIGN KEY(role_id) REFERENCES roles(id)
 )`);


    // Seed roles
    const insertRoleStmt = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
    roles.forEach(role => insertRoleStmt.run(role));
    insertRoleStmt.finalize();
    console.log('Roles seeded.');

    // Seed permissions
    const insertPermissionStmt = db.prepare('INSERT OR IGNORE INTO permissions (action, subject) VALUES (?, ?)');
    permissions.forEach(p => insertPermissionStmt.run(p.action, p.subject));
    insertPermissionStmt.finalize();
    console.log('Permissions seeded.');

    // Seed role_permissions
    const insertRolePermissionStmt = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
    db.all('SELECT * FROM roles', [], (err, dbRoles) => {
      if (err) throw err;
      db.all('SELECT * FROM permissions', [], (err, dbPermissions) => {
        if (err) throw err;

        const roleMap = new Map(dbRoles.map(r => [r.name, r.id]));
        const permissionMap = new Map(dbPermissions.map(p => [`${p.action}:${p.subject}`, p.id]));

        Object.entries(rolePermissions).forEach(([roleName, perms]) => {
          const roleId = roleMap.get(roleName);
          perms.forEach(permName => {
            const permissionId = permissionMap.get(permName);
            if (roleId && permissionId) {
              insertRolePermissionStmt.run(roleId, permissionId);
            }
          });
        });
        insertRolePermissionStmt.finalize();
        console.log('Role permissions seeded.');

        // Seed Admin User
        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword';
        const adminFullName = 'Admin User';
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        const adminRoleId = roleMap.get('admin');

        const insertAdminStmt = db.prepare("INSERT OR IGNORE INTO users (username, password, fullName, role_id, phoneNumber, country, city) VALUES (?, ?, ?, ?, ?, ?, ?)");
        insertAdminStmt.run(adminEmail, hashedPassword, adminFullName, adminRoleId, '555-0100', 'Adminland', 'Admin City', (err) => {
          if (err) console.error('Error inserting admin user:', err.message);
        });
        insertAdminStmt.finalize();
        console.log('Admin user seeding attempted.');

        seedProductsAndCategories();
      });
    });
  });

  function seedProductsAndCategories() {
    // Create categories, products, and product_variants tables if they don't exist
 db.run(`CREATE TABLE IF NOT EXISTS categories (
 id TEXT PRIMARY KEY,
 name TEXT,
 slug TEXT UNIQUE
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS products (
 id TEXT PRIMARY KEY,
 name TEXT,
 slug TEXT UNIQUE,
 description TEXT,
 categoryId TEXT,
 optionGroups TEXT,
 FOREIGN KEY(categoryId) REFERENCES categories(id)
 )`);
    const insertCategoryStmt = db.prepare('INSERT OR IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)');
    allCategories.forEach(category => insertCategoryStmt.run(category.id, category.name, category.slug));
    insertCategoryStmt.finalize();
    console.log('Categories seeded.');

    const insertProductStmt = db.prepare('INSERT OR IGNORE INTO products (id, name, slug, description, categoryId, optionGroups) VALUES (?, ?, ?, ?, ?, ?)');
    const insertVariantStmt = db.prepare('INSERT OR IGNORE INTO product_variants (id, productId, name, price, image, stock, color_hex) VALUES (?, ?, ?, ?, ?, ?, ?)');
 db.run(`CREATE TABLE IF NOT EXISTS product_variants (
 id TEXT PRIMARY KEY,
      productId TEXT,
      name TEXT,
 price REAL,
 image TEXT,
 stock INTEGER,
 color_hex TEXT,
 FOREIGN KEY(productId) REFERENCES products(id)
 )`);
    allProducts.forEach(product => {
      insertProductStmt.run(product.id, product.name, product.slug, product.description, product.categoryId, product.optionGroups, (err) => {
        if (err) {
          console.error(`Error inserting product ${product.name}:`, err.message);
        }
      });
      product.variants.forEach(variant => {
        insertVariantStmt.run(variant.id, product.id, variant.name, variant.price, variant.image, variant.stock, variant.color_hex, (err) => {
          if (err) {
            console.error(`Error inserting variant ${variant.name} for product ${product.name}:`, err.message);
          }
        });
      });
    });
    
    insertProductStmt.finalize();
    insertVariantStmt.finalize();
    console.log('Products and variants seeded.');

    db.close(err => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}
