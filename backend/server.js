// backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, '../database/energy_trades.db'), (err) => {
  if (err) {
    console.error('Failed to connect to SQLite:', err.message);
    process.exit(1); // Exit if connection fails
  } else {
    console.log('Successfully connected to SQLite');
  }
});

// Enable CORS for frontend requests
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// Get all communities
app.get('/api/communities', (req, res) => {
  db.all('SELECT * FROM communities ORDER BY id', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get users (households) by community_id
app.get('/api/users/:community_id', (req, res) => {
  const { community_id } = req.params;
  db.all('SELECT uuid, name FROM users WHERE community_id = ? ORDER BY name', [community_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});