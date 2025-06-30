const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');
const { allCategories, allProducts } = require('./src/lib/mock-data.js');
const { citiesByCountry } = require('./src/lib/cities.js');

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
    db.run(`CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)`);
    db.run(`CREATE TABLE IF NOT EXISTS permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, subject TEXT, UNIQUE(action, subject))`);
    db.run(`CREATE TABLE IF NOT EXISTS role_permissions (role_id INTEGER, permission_id INTEGER, FOREIGN KEY(role_id) REFERENCES roles(id), FOREIGN KEY(permission_id) REFERENCES permissions(id), UNIQUE(role_id, permission_id))`);
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, fullName TEXT, role_id INTEGER, phoneNumber TEXT, country TEXT, city TEXT, logo TEXT, FOREIGN KEY(role_id) REFERENCES roles(id))`);
    db.run(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY DEFAULT 1, websiteTitle TEXT, websiteLogo TEXT, timeZone TEXT, country TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS payment_methods (id INTEGER PRIMARY KEY, provider TEXT UNIQUE NOT NULL, enabled BOOLEAN DEFAULT 0, config TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS cities (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, country_name TEXT NOT NULL, UNIQUE(name, country_name))`);
    db.run(`CREATE TABLE IF NOT EXISTS areas (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, city_id INTEGER NOT NULL, UNIQUE(name, city_id), FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE)`);

    // Seed roles
    const insertRoleStmt = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
    roles.forEach(role => insertRoleStmt.run(role));
    insertRoleStmt.finalize();
    console.log('Roles seeded.');
    
    // Seed Settings
    const insertSettingsStmt = db.prepare('INSERT OR IGNORE INTO settings (id, websiteTitle, websiteLogo, timeZone, country) VALUES (?, ?, ?, ?, ?)');
    insertSettingsStmt.run(1, 'Zain Inspired E-Shop', 'https://placehold.co/100x40.png', 'UTC', 'USA', (err) => {
      if (err) console.error('Error inserting settings:', err.message);
    });
    insertSettingsStmt.finalize();
    console.log('Settings seeded.');
    
    // Seed Payment Methods
    const paymentMethods = [
      { provider: 'cash', enabled: 1, config: JSON.stringify({ description: 'Pay with cash upon delivery.' }) },
      { provider: 'stripe', enabled: 0, config: JSON.stringify({ publishableKey: '', secretKey: '' }) },
      { provider: 'paypal', enabled: 0, config: JSON.stringify({ clientId: '' }) }
    ];
    const insertPaymentStmt = db.prepare('INSERT OR IGNORE INTO payment_methods (provider, enabled, config) VALUES (?, ?, ?)');
    paymentMethods.forEach(pm => insertPaymentStmt.run(pm.provider, pm.enabled, pm.config));
    insertPaymentStmt.finalize();
    console.log('Payment methods seeded.');

    // Seed Cities
    const insertCityStmt = db.prepare('INSERT OR IGNORE INTO cities (name, country_name) VALUES (?, ?)');
    Object.entries(citiesByCountry).forEach(([country, cities]) => {
        cities.forEach(city => {
            insertCityStmt.run(city, country);
        });
    });
    insertCityStmt.finalize();
    console.log('Cities seeded.');

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

        // Seed Users
        const insertUserStmt = db.prepare("INSERT OR IGNORE INTO users (username, password, fullName, role_id, phoneNumber, country, city, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Seed Admin User
        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword';
        const adminFullName = 'Admin User';
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        const adminRoleId = roleMap.get('admin');
        insertUserStmt.run(adminEmail, hashedPassword, adminFullName, adminRoleId, '555-0100', 'Adminland', 'Admin City', null, (err) => {
          if (err) console.error('Error inserting admin user:', err.message);
        });

        // Seed Customer User
        const customerEmail = 'customer@example.com';
        const customerPassword = 'customerpassword';
        const customerFullName = 'Test Customer';
        const hashedCustomerPassword = bcrypt.hashSync(customerPassword, 10);
        const customerRoleId = roleMap.get('customer');
        insertUserStmt.run(customerEmail, hashedCustomerPassword, customerFullName, customerRoleId, '555-0102', 'Customerland', 'Customer City', null, (err) => {
            if (err) console.error('Error inserting customer user:', err.message);
        });
        
        // Seed Vendor User
        const vendorEmail = 'vendor@example.com';
        const vendorPassword = 'vendorpassword';
        const vendorFullName = 'Awesome Gadgets Inc.';
        const hashedVendorPassword = bcrypt.hashSync(vendorPassword, 10);
        const vendorRoleId = roleMap.get('vendor');
        
        insertUserStmt.run(vendorEmail, hashedVendorPassword, vendorFullName, vendorRoleId, '555-0101', 'Vendoria', 'Vendor City', 'https://placehold.co/100x100.png', function(err) {
            if (err) {
                console.error('Error inserting vendor user:', err.message);
                seedProductsAndCategories(null); // Proceed without a vendor if insertion fails
            } else {
                console.log('Vendor user seeding attempted.');
                // We need to find the ID of the vendor we just inserted.
                db.get("SELECT id FROM users WHERE username = ?", [vendorEmail], (err, row) => {
                    if (err || !row) {
                        console.error('Could not find vendor ID after insertion.');
                        seedProductsAndCategories(null);
                    } else {
                        seedProductsAndCategories(row.id);
                    }
                });
            }
        });
        insertUserStmt.finalize();

      });
    });
  });

  function seedProductsAndCategories(vendorId) {
    if (!vendorId) {
      console.warn("No vendor ID provided, products will not be associated with a vendor.");
    }

    // Create categories, products, and product_variants tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    slug TEXT UNIQUE,
    image TEXT,
    parentId TEXT, 
    FOREIGN KEY(parentId) REFERENCES categories(id) ON DELETE SET NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    slug TEXT UNIQUE,
    description TEXT,
    categoryId TEXT,
    vendorId INTEGER,
    optionGroups TEXT,
    tags TEXT, 
    isFeatured BOOLEAN, 
    isOnOffer BOOLEAN, 
    weight REAL, 
    dimensions TEXT,
    FOREIGN KEY(categoryId) REFERENCES categories(id),
    FOREIGN KEY(vendorId) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
        productId TEXT,
        name TEXT,
    price REAL,
    image TEXT,
    stock INTEGER,
    options TEXT,
    FOREIGN KEY(productId) REFERENCES products(id)
    )`);

    const insertCategoryStmt = db.prepare('INSERT OR IGNORE INTO categories (id, name, slug, image, parentId) VALUES (?, ?, ?, ?, ?)');
    allCategories.forEach(category => insertCategoryStmt.run(category.id, category.name, category.slug, category.image, category.parentId || null));
    insertCategoryStmt.finalize();
    console.log('Categories seeded.');

    const insertProductStmt = db.prepare('INSERT OR IGNORE INTO products (id, name, slug, description, categoryId, vendorId, optionGroups, tags, isFeatured, isOnOffer, weight, dimensions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insertVariantStmt = db.prepare('INSERT OR IGNORE INTO product_variants (id, productId, name, price, image, stock, options) VALUES (?, ?, ?, ?, ?, ?, ?)');

    allProducts.forEach(product => {
      insertProductStmt.run(product.id, product.name, product.slug, product.description, product.categoryId, vendorId, product.optionGroups, product.tags, product.isFeatured, product.isOnOffer, product.weight, product.dimensions, (err) => {
        if (err) {
          console.error(`Error inserting product ${product.name}:`, err.message);
        }
      });
      product.variants.forEach(variant => {
        insertVariantStmt.run(variant.id, product.id, variant.name, variant.price, variant.image, variant.stock, variant.options, (err) => {
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
