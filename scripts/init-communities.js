// scripts/init-communities.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Define the database path
const dbPath = path.join(__dirname, '../database/energy_trades.db');

// Ensure the database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  // Create communities table
  db.run(`
    CREATE TABLE IF NOT EXISTS communities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating communities table:', err.message);
    } else {
      console.log('Communities table created or already exists.');
    }
  });

  // Insert sample communities
  const communities = [
    { name: 'Green Village' },
    { name: 'Solar Hamlet' },
    { name: 'Eco Town' },
    { name: 'Hidalgo' },
    { name: 'Shoreline' }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO communities (name) VALUES (?)
  `);
  communities.forEach((community) => {
    stmt.run(community.name, (err) => {
      if (err) {
        console.error('Error inserting community:', err.message);
      }
    });
  });
  stmt.finalize();

  // Verify data
  db.all('SELECT * FROM communities', [], (err, rows) => {
    if (err) {
      console.error('Error querying communities:', err.message);
    } else {
      console.log('Communities:');
      console.table(rows);
    }
  });
});

// Close the database
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});