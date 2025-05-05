// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const dbPath = path.join(__dirname, '../database/energy_trades.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// API to get communities
app.get('/api/communities', (req, res) => {
  db.all('SELECT * FROM communities', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// New API to get households by community ID
app.get('/api/communities/:communityId/households', (req, res) => {
  const communityId = req.params.communityId;
  db.all('SELECT uuid, name FROM households WHERE community_id = ?', [communityId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});