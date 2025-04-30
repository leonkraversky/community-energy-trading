// scripts/init-users.js
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
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      community_id INTEGER NOT NULL,
      FOREIGN KEY (community_id) REFERENCES communities(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });

  // Insert users (households)
  const users = [
    // Green Village (community_id: 1)
    { uuid: '11122233-4444-5555-6666-777888999000', name: 'Lee Family', community_id: 1 },
    { uuid: '22233344-5555-6666-7777-888999000111', name: 'Chen Household', community_id: 1 },
    { uuid: '33344455-6666-7777-8888-999000111222', name: 'Patel Residence', community_id: 1 },
    // Solar Hamlet (community_id: 2)
    { uuid: '44455566-7777-8888-9999-000111222333', name: 'Kim Family', community_id: 2 },
    { uuid: '55566677-8888-9999-0000-111222333444', name: 'Nguyen Household', community_id: 2 },
    { uuid: '66677788-9999-0000-1111-222333444555', name: 'Singh Residence', community_id: 2 },
    // Eco Town (community_id: 3)
    { uuid: '77788899-0000-1111-2222-333444555666', name: 'Garcia Family', community_id: 3 },
    { uuid: '88899900-1111-2222-3333-444555666777', name: 'Lopez Household', community_id: 3 },
    { uuid: '99900011-2222-3333-4444-555666777888', name: 'Martinez Residence', community_id: 3 },
    // Hidalgo (community_id: 4)
    { uuid: '123e4567-e89b-12d3-a456-426614174000', name: 'Smith Family', community_id: 4 },
    { uuid: '987fcdeb-1234-5678-b901-426614174001', name: 'Johnson Household', community_id: 4 },
    { uuid: '456789ab-cdef-1234-5678-426614174002', name: 'Brown Residence', community_id: 4 },
    // Shoreline (community_id: 5)
    { uuid: '789abc12-3456-7890-def1-426614174003', name: 'Davis Family', community_id: 5 },
    { uuid: '321fedcb-9876-5432-10ab-426614174004', name: 'Wilson Home', community_id: 5 },
    { uuid: '654321ab-cdef-9876-5432-426614174005', name: 'Taylor Residence', community_id: 5 },
  ];

  const userStmt = db.prepare(`
    INSERT OR IGNORE INTO users (uuid, name, community_id) VALUES (?, ?, ?)
  `);
  users.forEach((user) => {
    userStmt.run(user.uuid, user.name, user.community_id, (err) => {
      if (err) {
        console.error(`Error inserting user ${user.name}:`, err.message);
      }
    });
  });
  userStmt.finalize();

  // Verify users
  db.all('SELECT * FROM users ORDER BY community_id, name', [], (err, rows) => {
    if (err) {
      console.error('Error querying users:', err.message);
    } else {
      console.log('Users:');
      console.table(rows);
    }
  });

  // Verify communities (for reference, no modifications)
  db.all('SELECT * FROM communities ORDER BY id', [], (err, rows) => {
    if (err) {
      console.error('Error querying communities:', err.message);
    } else {
      console.log('Existing Communities (unchanged):');
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