const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/energy_trades.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Generate unique electricity prices for a day
const generatePrices = (date, isNegativeAtNoon = false) => {
  const prices = [];
  let basePrice = 0.05; // Start with a base price

  for (let hour = 0; hour < 24; hour++) {
    for (let half = 0; half < 2; half++) {
      const time = `${String(hour).padStart(2, '0')}:${half === 0 ? '00' : '30'}`;
      let price;

      if (hour === 12) {
        // Noon time special cases
        if (isNegativeAtNoon) {
          price = half === 0 ? -0.05 : 0.02; // Negative fluctuation for April 16
        } else {
          price = half === 0 ? 0.01 : 0.02; // Very low price for April 17
        }
      } else {
        // Generate unique price with slight random fluctuation
        price = basePrice + Math.random() * 0.10; // Random fluctuation within 0.05 to 0.15
        price = parseFloat(price.toFixed(2)); // Round to 2 decimal places
        basePrice = price; // Update base price for the next interval
      }

      prices.push({ date, time, price });
    }
  }

  return prices;
};

// Create unique prices for April 16 and April 17
const electricityPrices = [
  ...generatePrices("2025-04-16", true), // April 16 with negative price fluctuation at noon
  ...generatePrices("2025-04-17", false) // April 17 with very low price at noon
];

db.serialize(() => {
  // Create the electricity_prices table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS electricity_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);

  // Insert the electricity price data
  const stmt = db.prepare(`
    INSERT INTO electricity_prices (date, time, price)
    VALUES (?, ?, ?)
  `);

  electricityPrices.forEach(({ date, time, price }) => {
    stmt.run(date, time, price);
  });

  stmt.finalize();
  console.log('Electricity price data successfully populated!');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});