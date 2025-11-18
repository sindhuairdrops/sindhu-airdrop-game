// main.js — single process bot + server

console.log("== STARTING APPLICATION ==");

require("dotenv").config();

const express = require("express");
const path = require("path");

// ---------------------------------------
// 1. LOAD BOT (index.js handles bot setup)
// ---------------------------------------
console.log("Loading bot...");
require("./index.js");   // <-- IMPORTANT FIX

// ---------------------------------------
// 2. START EXPRESS SERVER
// ---------------------------------------
console.log("Starting server...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Admin routes
try {
  const adminRoutes = require("./routes/admin");
  app.use("/admin", adminRoutes);
  console.log("Admin routes loaded.");
} catch (err) {
  console.error("Admin route error:", err);
}

// Telegram webhook endpoint
app.post("/webhook", (req, res) => {
  if (!global.bot) {
    console.log("⚠️ Bot missing!");
    return res.sendStatus(500);
  }

  try {
    global.bot.processUpdate(req.body);
    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook ERROR:", err);
    return res.sendStatus(500);
  }
});

// Health check
app.get("/ping", (req, res) => res.send("pong"));

// Render dynamic port
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
