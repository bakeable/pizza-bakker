#!/usr/bin/env node

import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "pizza-bakker.db");
const db = new Database(dbPath);

// Initialize database schema
export function initializeDatabase() {
  // Price
  db.exec(`
        CREATE TABLE IF NOT EXISTS pizza_price (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          size TEXT CHECK(size IN ('small', 'medium', 'large')) NOT NULL,
          price REAL NOT NULL
        )
    `);

  // Toppings
  db.exec(`
        CREATE TABLE IF NOT EXISTS toppings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          price REAL NOT NULL
        )
    `);

  // Drinks
  db.exec(`
        CREATE TABLE IF NOT EXISTS drinks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          price REAL NOT NULL
        )
    `);

  // Pizza presets
  db.exec(`
        CREATE TABLE IF NOT EXISTS pizza_presets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        )
    `);

  // Pizza presets <-> toppings (many-to-many)
  db.exec(`
        CREATE TABLE IF NOT EXISTS pizza_preset_toppings (
          preset_id INTEGER NOT NULL,
          topping_id INTEGER NOT NULL,
          FOREIGN KEY (preset_id) REFERENCES pizza_presets (id),
          FOREIGN KEY (topping_id) REFERENCES toppings (id),
          PRIMARY KEY (preset_id, topping_id)
        )
    `);

  // Coupons
  db.exec(`
        CREATE TABLE IF NOT EXISTS coupons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          discount_percentage REAL NOT NULL
        )
    `);

  // Orders
  db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          coupon_id INTEGER,
          customer_name TEXT NOT NULL,
          total_price REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          discount REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (coupon_id) REFERENCES coupons (id)
        )
    `);

  // Order items)
  db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          size TEXT CHECK(size IN ('small', 'medium', 'large')) NOT NULL,
          drink_id INTEGER,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          discount REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (drink_id) REFERENCES drinks (id),
          FOREIGN KEY (order_id) REFERENCES orders (id),
          UNIQUE (order_id, id)
        )
    `);

  // Order items <-> toppings (many-to-many)
  db.exec(`
        CREATE TABLE IF NOT EXISTS order_item_toppings (
          order_item_id INTEGER NOT NULL,
          topping_id INTEGER NOT NULL,
          FOREIGN KEY (order_item_id) REFERENCES order_items (id),
          FOREIGN KEY (topping_id) REFERENCES toppings (id),
          PRIMARY KEY (order_item_id, topping_id)
        )
    `);

  // Insert default data
  insertDefaultData();
}

// Export for testing purposes
export const toppings = [
  ["Pepperoni", 2.5],
  ["Mushrooms", 1.5],
  ["Bell Peppers", 1.5],
  ["Onions", 1.0],
  ["Sausage", 3.0],
  ["Pineapple", 2.0],
  ["Black Olives", 1.75],
  ["Mozzarella Cheese", 2.25],
  ["Bacon", 3.5],
  ["Tomatoes", 1.25],
  ["Spinach", 1.5],
  ["Ham", 2.75],
];

export const drinks = [
  ["Coca Cola", 2.5],
  ["Sprite", 2.5],
  ["Orange Juice", 3.0],
  ["Water", 1.5],
  ["Beer", 4.0],
];

export const presetToppings: Record<string, string[]> = {
  Margherita: ["Mozzarella Cheese"],
  "Pepperoni Classic": ["Pepperoni", "Mozzarella Cheese"],
  Hawaiian: ["Ham", "Pineapple", "Mozzarella Cheese"],
  "Meat Lovers": ["Pepperoni", "Sausage", "Bacon", "Ham"],
  "Veggie Supreme": ["Mushrooms", "Bell Peppers", "Onions", "Black Olives"],
};

export const prices = [
  ["small", 8.0],
  ["medium", 12.0],
  ["large", 16.0],
];

export const presetNames = [
  "Margherita",
  "Pepperoni Classic",
  "Hawaiian",
  "Meat Lovers",
  "Veggie Supreme",
];

export const coupons = [
  ["WELCOME10", 10],
  ["RETURN15", 15],
  ["LOYAL20", 20],
];

function insertDefaultData() {
  // Toppings
  const insertTopping = db.prepare(`
        INSERT OR IGNORE INTO toppings (name, price) VALUES (?, ?)
    `);

  toppings.forEach(([name, price]) => {
    insertTopping.run(name, price);
  });

  // Drinks
  const insertDrink = db.prepare(`
        INSERT OR IGNORE INTO drinks (name, price) VALUES (?, ?)
    `);

  drinks.forEach(([name, price]) => {
    insertDrink.run(name, price);
  });

  // Pizza presets
  const insertPreset = db.prepare(`
        INSERT OR IGNORE INTO pizza_presets (name) VALUES (?)
    `);

  // Insert presets
  const presetIds: Record<string, number> = {};
  presetNames.forEach((name) => {
    insertPreset.run(name);
    const row = db
      .prepare("SELECT id FROM pizza_presets WHERE name = ?")
      .get(name) as { id: number } | undefined;
    if (row) presetIds[name] = row.id;
  });

  // Map names to ID
  const toppingRows = db.prepare("SELECT id, name FROM toppings").all() as {
    id: number;
    name: string;
  }[];
  const toppingIds: Record<string, number> = {};
  toppingRows.forEach(({ id, name }) => {
    toppingIds[name] = id;
  });

  // Insert pizza_preset_toppings
  const insertPresetTopping = db.prepare(`
        INSERT OR IGNORE INTO pizza_preset_toppings (preset_id, topping_id) VALUES (?, ?)
    `);

  Object.entries(presetToppings).forEach(([preset, toppings]) => {
    const presetId = presetIds[preset];
    toppings.forEach((topping) => {
      const toppingId = toppingIds[topping];
      if (presetId && toppingId) {
        insertPresetTopping.run(presetId, toppingId);
      }
    });
  });

  // Pizza prices
  const insertPrice = db.prepare(`
    INSERT OR IGNORE INTO pizza_price (size, price) VALUES (?, ?)
  `);

  prices.forEach(([size, price]) => {
    insertPrice.run(size, price);
  });

  // Coupons
  const insertCoupon = db.prepare(`
        INSERT OR IGNORE INTO coupons (code, discount_percentage) VALUES (?, ?)
    `);
  coupons.forEach(([code, discount]) => {
    insertCoupon.run(code, discount);
  });
}

export default db;

if (require.main === module) {
  console.log("Initializing pizza-bakker database...");
  initializeDatabase();
  console.log("Database initialized successfully.");
}
