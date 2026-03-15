const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = new Database("chat.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

app.get("/messages", (req, res) => {
  const rows = db.prepare(`
    SELECT u.username, m.content, m.timestamp
    FROM messages m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.timestamp ASC
  `).all();
  res.json(rows);
});

app.post("/messages", (req, res) => {
  const { username, content } = req.body;
  if (!username || !content) return res.status(400).json({ error: "Eksik alan" });

  db.prepare(`INSERT OR IGNORE INTO users (username) VALUES (?)`).run(username);
  const user = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username);
  const result = db.prepare(`INSERT INTO messages (user_id, content) VALUES (?, ?)`).run(user.id, content);

  res.json({ success: true, id: result.lastInsertRowid });
});

app.listen(3000, () => console.log("✅ Sunucu hazır → http://localhost:3000"));