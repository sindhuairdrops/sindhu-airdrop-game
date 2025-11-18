// main.js — single process bot + server

console.log("== STARTING APPLICATION ==");

require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const path = require("path");

// ---------------------------------------
// 1. LOAD BOT
// ---------------------------------------
console.log("Loading bot...");

// 🔥 LOAD BOT COMMANDS (.onText, .callback_query, etc.)
require("./index.js");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: false
});

// Make bot global for webhook handler
global.bot = bot;

bot.on("message", (msg) => {
  console.log("Message received:", msg.text);
});

// ---------------------------------------
// 2. SET WEBHOOK
// ---------------------------------------
const WEBHOOK_URL = process.env.WEBAPP_URL + "/webhook";

bot.setWebHook(WEBHOOK_URL)
  .then(() => console.log("Webhook set:", WEBHOOK_URL))
  .catch(err => console.error("Webhook error:", err));

// ---------------------------------------
// 3. START EXPRESS SERVER
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
    console.error("Webhook process ERROR:", err);
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
