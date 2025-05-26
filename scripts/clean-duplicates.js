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
  db.run("BEGIN TRANSACTION;", (err) => {
    if (err) {
      console.error('Error starting transaction:', err.message);
      return;
    }
    console.log('Transaction started.');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS communities_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating new table:', err.message);
      db.run("ROLLBACK;");
      return;
    }
    console.log('New table created.');
  });

  db.run(`
    INSERT INTO communities_new (id, name, created_at)
    SELECT MIN(id), name, MIN(created_at)
    FROM communities
    GROUP BY name
  `, (err) => {
    if (err) {
      console.error('Error copying distinct communities:', err.message);
      db.run("ROLLBACK;");
      return;
    }
    console.log('Distinct communities copied.');
  });

  db.run(`DROP TABLE communities`, (err) => {
    if (err) {
      console.error('Error dropping old table:', err.message);
      db.run("ROLLBACK;");
      return;
    }
    console.log('Old table dropped.');
  });

  db.run(`ALTER TABLE communities_new RENAME TO communities`, (err) => {
    if (err) {
      console.error('Error renaming table:', err.message);
      db.run("ROLLBACK;");
      return;
    }
    console.log('Table rename successful.');
  });

  db.run("COMMIT;", (err) => {
    if (err) {
      console.error('Error committing transaction:', err.message);
    } else {
      console.log('Transaction committed.');
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