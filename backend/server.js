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

// API to get households by community ID
app.get('/api/communities/:communityId/households', (req, res) => {
  const communityId = parseInt(req.params.communityId, 10);

  // Validate communityId is a positive integer
  if (isNaN(communityId) || communityId <= 0) {
    res.status(400).json({ error: 'Invalid community ID. Must be a positive integer.' });
    return;
  }

  db.all('SELECT uuid, name FROM households WHERE community_id = ?', [communityId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API to get the electricity prices by date
app.get('/api/electricity-prices/:date', (req, res) => {
  const date = req.params.date;

  const sql = `
    SELECT time, price
    FROM electricity_prices
    WHERE date = ?
    ORDER BY time ASC
  `;
  db.all(sql, [date], (err, rows) => {
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