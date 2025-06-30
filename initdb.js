const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Drop existing tables to ensure a clean slate, especially for schema changes.
  db.run("DROP TABLE IF EXISTS addresses");
  db.run("DROP TABLE IF EXISTS role_permissions");
  db.run("DROP TABLE IF EXISTS permissions");
  db.run("DROP TABLE IF EXISTS product_variants");
  db.run("DROP TABLE IF EXISTS products");
  db.run("DROP TABLE IF EXISTS categories");
  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS roles");
  db.run("DROP TABLE IF EXISTS settings");
  db.run("DROP TABLE IF EXISTS payment_methods");
  db.run("DROP TABLE IF EXISTS areas");
  db.run("DROP TABLE IF EXISTS cities");
  db.run("DROP TABLE IF EXISTS shipping_methods");
  db.run("DROP TABLE IF EXISTS slides");


  // Create roles table
  db.run("CREATE TABLE roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)");

  // Create users table with a foreign key to roles and new fields
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      fullName TEXT,
      phoneNumber TEXT,
      country TEXT,
      city TEXT,
      logo TEXT,
      role_id INTEGER,
      FOREIGN KEY(role_id) REFERENCES roles(id)
    )
  `);

  // Create permissions table
  db.run("CREATE TABLE permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, subject TEXT NOT NULL, UNIQUE(action, subject))");

  // Create role_permissions join table
  db.run(`
    CREATE TABLE role_permissions (
      role_id INTEGER,
      permission_id INTEGER,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY(role_id) REFERENCES roles(id),
      FOREIGN KEY(permission_id) REFERENCES permissions(id)
    )
  `);

  // Create addresses table
  db.run(`
    CREATE TABLE addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      fullName TEXT,
      street TEXT NOT NULL,
      apartment TEXT,
      city TEXT NOT NULL,
      area TEXT,
      state TEXT,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      isPrimary BOOLEAN DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Create cities table
  db.run("CREATE TABLE cities (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, country_name TEXT NOT NULL, UNIQUE(name, country_name))");

  // Create areas table
  db.run("CREATE TABLE areas (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, city_id INTEGER NOT NULL, UNIQUE(name, city_id), FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE)");

  // Create slides table
  db.run(`
    CREATE TABLE slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT NOT NULL,
      link TEXT,
      buttonText TEXT,
      isActive BOOLEAN DEFAULT 0,
      "order" INTEGER DEFAULT 0
    )
  `);

  // Keep other tables
  db.run("CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT, slug TEXT UNIQUE, image TEXT, parentId TEXT, FOREIGN KEY(parentId) REFERENCES categories(id) ON DELETE SET NULL)");
  db.run("CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT, slug TEXT UNIQUE, description TEXT, categoryId TEXT, vendorId INTEGER, optionGroups TEXT, tags TEXT, isFeatured BOOLEAN DEFAULT 0, isOnOffer BOOLEAN DEFAULT 0, weight REAL, dimensions TEXT, FOREIGN KEY(categoryId) REFERENCES categories(id), FOREIGN KEY(vendorId) REFERENCES users(id))");
  db.run("CREATE TABLE product_variants (id TEXT PRIMARY KEY, productId TEXT, name TEXT, price INTEGER, image TEXT, stock INTEGER, options TEXT, FOREIGN KEY(productId) REFERENCES products(id))");
  db.run("CREATE TABLE settings (id INTEGER PRIMARY KEY DEFAULT 1, websiteTitle TEXT, websiteLogo TEXT, timeZone TEXT, country TEXT)");
  db.run("CREATE TABLE payment_methods (id INTEGER PRIMARY KEY, provider TEXT UNIQUE NOT NULL, enabled BOOLEAN DEFAULT 0, config TEXT)");
  db.run(`
    CREATE TABLE shipping_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      logo TEXT,
      cost_type TEXT NOT NULL, -- 'city', 'area', 'weight'
      default_cost REAL, -- For city/area based shipping
      config TEXT, -- JSON for weight cost or specific overrides
      enabled BOOLEAN DEFAULT 0
    )
  `);
});

db.close();
