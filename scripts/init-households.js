const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/energy_trades.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Define communities
const communities = [
  { id: 1, name: 'GreenVillage' },
  { id: 2, name: 'SolarHamlet' },
  { id: 3, name: 'EcoTown' },
  { id: 4, name: 'Hidalgo' },
  { id: 5, name: 'Shoreline' }
];

// Define households
const households = [
  { uuid: '11111111-1111-1111-1111-111111111111', name: 'Clark Household', community_id: 1 },
  { uuid: '22222222-2222-2222-2222-222222222222', name: 'Lee Family', community_id: 1 },
  { uuid: '33333333-3333-3333-3333-333333333333', name: 'Martinez Home', community_id: 2 },
  { uuid: '44444444-4444-4444-4444-444444444444', name: 'Nguyen Residence', community_id: 2 },
  { uuid: '55555555-5555-5555-5555-555555555555', name: 'Patel Family', community_id: 3 },
  { uuid: '66666666-6666-6666-6666-666666666666', name: 'Kim Household', community_id: 3 },
  { uuid: '123e4567-e89b-12d3-a456-426614174000', name: 'Smith Family', community_id: 4 },
  { uuid: '987fcdeb-1234-5678-b901-426614174001', name: 'Johnson Household', community_id: 4 },
  { uuid: '456789ab-cdef-1234-5678-426614174002', name: 'Brown Residence', community_id: 4 },
  { uuid: '789abc12-3456-7890-def1-426614174003', name: 'Davis Family', community_id: 5 },
  { uuid: '321fedcb-9876-5432-10ab-426614174004', name: 'Wilson Home', community_id: 5 },
  { uuid: '654321ab-cdef-9876-5432-426614174005', name: 'Taylor Residence', community_id: 5 }
];

db.serialize(() => {
  // Create communities table
  db.run(`CREATE TABLE IF NOT EXISTS communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating communities table:', err.message);
  });

  // Create households table
  db.run(`CREATE TABLE IF NOT EXISTS households (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    community_id INTEGER NOT NULL,
    FOREIGN KEY (community_id) REFERENCES communities(id)
  )`, (err) => {
    if (err) console.error('Error creating households table:', err.message);
  });

  // Create index
  db.run(`CREATE INDEX IF NOT EXISTS idx_households_community_id ON households(community_id)`, (err) => {
    if (err) console.error('Error creating index:', err.message);
  });

  // Clear existing data (optional, comment out if you want to preserve data)
  db.run(`DELETE FROM households`, (err) => {
    if (err) console.error('Error clearing households:', err.message);
  });
  db.run(`DELETE FROM communities`, (err) => {
    if (err) console.error('Error clearing communities:', err.message);
  });

  // Insert communities
  console.log('Inserting communities...');
  const communityStmt = db.prepare('INSERT OR IGNORE INTO communities (id, name) VALUES (?, ?)');
  communities.forEach(c => {
    communityStmt.run(c.id, c.name, (err) => {
      if (err) console.error(`Error inserting community ${c.name}:`, err.message);
    });
  });
  communityStmt.finalize();

  // Insert households
  console.log('Inserting households...');
  const householdStmt = db.prepare('INSERT OR IGNORE INTO households (uuid, name, community_id) VALUES (?, ?, ?)');
  households.forEach(h => {
    householdStmt.run(h.uuid, h.name, h.community_id, (err) => {
      if (err) console.error(`Error inserting household ${h.name}:`, err.message);
    });
  });
  householdStmt.finalize();
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database initialization complete');
  }
});