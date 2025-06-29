const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Drop existing tables to ensure a clean slate, especially for schema changes.
  db.run("DROP TABLE IF EXISTS addresses");
  db.run("DROP TABLE IF EXISTS role_permissions");
  db.run("DROP TABLE IF EXISTS permissions");
  db.run("DROP TABLE IF EXISTS product_variants");
  db.run("DROP TABLE IF EXISTS products");
  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS roles");
  db.run("DROP TABLE IF EXISTS categories");


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
      state TEXT,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      isPrimary BOOLEAN DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Keep other tables
  db.run("CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT, slug TEXT UNIQUE, image TEXT)");
  db.run("CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT, slug TEXT UNIQUE, description TEXT, categoryId TEXT, vendorId INTEGER, optionGroups TEXT, tags TEXT, isFeatured BOOLEAN DEFAULT 0, isOnOffer BOOLEAN DEFAULT 0, weight REAL, dimensions TEXT, FOREIGN KEY(categoryId) REFERENCES categories(id), FOREIGN KEY(vendorId) REFERENCES users(id))");
  db.run("CREATE TABLE product_variants (id TEXT PRIMARY KEY, productId TEXT, name TEXT, price INTEGER, image TEXT, stock INTEGER, options TEXT, FOREIGN KEY(productId) REFERENCES products(id))");
});

db.close();
