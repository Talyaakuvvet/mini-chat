const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Veritabanı yerine memory'de tutuyoruz
const users = [];
const messages = [];
let userId = 1;
let messageId = 1;

app.get("/messages", (req, res) => {
  const result = messages.map(m => {
    const user = users.find(u => u.id === m.user_id);
    return {
      username: user ? user.username : "bilinmeyen",
      content: m.content,
      timestamp: m.timestamp
    };
  });
  res.json(result);
});

app.post("/messages", (req, res) => {
  const { username, content } = req.body;
  if (!username || !content) return res.status(400).json({ error: "Eksik alan" });

  let user = users.find(u => u.username === username);
  if (!user) {
    user = { id: userId++, username };
    users.push(user);
  }

  const message = {
    id: messageId++,
    user_id: user.id,
    content,
    timestamp: new Date().toISOString()
  };
  messages.push(message);

  res.json({ success: true, id: message.id });
});

app.listen(3000, () => console.log("✅ Sunucu hazır → http://localhost:3000"));