// scripts/clean-duplicates.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/energy_trades.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  // Step 1: Ensure UNIQUE constraint on name
  console.log('Adding UNIQUE constraint to communities table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS communities_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Step 2: Copy distinct communities (earliest id for each name)
  db.run(`
    INSERT INTO communities_new (id, name, created_at)
    SELECT MIN(id), name, MIN(created_at)
    FROM communities
    GROUP BY name
  `);

  // Step 3: Drop old table and rename new table
  db.run(`DROP TABLE communities`);
  db.run(`ALTER TABLE communities_new RENAME TO communities`);

  // Step 4: Verify the result
  db.all('SELECT * FROM communities ORDER BY id', [], (err, rows) => {
    if (err) {
      console.error('Error querying communities:', err.message);
    } else {
      console.log('Updated communities:');
      console.table(rows);
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});