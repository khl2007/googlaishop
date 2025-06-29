const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, fullName TEXT, role TEXT NOT NULL DEFAULT 'customer')");
  db.run("CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, slug TEXT UNIQUE)");
  db.run("CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT, slug TEXT UNIQUE, description TEXT, categoryId TEXT, FOREIGN KEY(categoryId) REFERENCES categories(id))");
  db.run("CREATE TABLE IF NOT EXISTS product_variants (id TEXT PRIMARY KEY, productId TEXT, name TEXT, price INTEGER, image TEXT, stock INTEGER, FOREIGN KEY(productId) REFERENCES products(id))");
});

db.close();
