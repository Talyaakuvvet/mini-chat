const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("chat.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

app.get("/messages", (req, res) => {
  db.all(`
    SELECT u.username, m.content, m.timestamp
    FROM messages m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.timestamp ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/messages", (req, res) => {
  const { username, content } = req.body;
  if (!username || !content) return res.status(400).json({ error: "Eksik alan" });

  db.run(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [username], function () {
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, user) => {
      if (err || !user) return res.status(500).json({ error: "Kullanıcı hatası" });

      db.run(`INSERT INTO messages (user_id, content) VALUES (?, ?)`,
        [user.id, content],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, id: this.lastID });
        }
      );
    });
  });
});

app.listen(3000, () => console.log("✅ Sunucu hazır → http://localhost:3000"));