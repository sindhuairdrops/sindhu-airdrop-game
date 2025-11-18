// main.js — single-process bot + express server

console.log("== STARTING APPLICATION ==");

require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const path = require("path");

// ---------------------------------------
// LOAD TELEGRAM BOT
// ---------------------------------------
console.log("Loading bot...");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: false
});

global.bot = bot;

// Basic message log (for debug)
bot.on("message", msg => {
  console.log("Message received:", msg.text);
});

// ---------------------------------------
// SET WEBHOOK
// ---------------------------------------
const WEBHOOK_URL = process.env.WEBAPP_URL + "/webhook";

bot.setWebHook(WEBHOOK_URL)
  .then(() => console.log("Webhook set:", WEBHOOK_URL))
  .catch(err => console.error("Webhook error:", err));


// ---------------------------------------
// EXPRESS SERVER
// ---------------------------------------

console.log("Starting server...");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public folder (webapp)
app.use(express.static(path.join(__dirname, "public")));

// Admin routes
try {
  const adminRoutes = require("./routes/admin");
  app.use("/admin", adminRoutes);
  console.log("Admin routes loaded.");
} catch (err) {
  console.error("Admin routes error:", err);
}

// Telegram Webhook Receiver
app.post("/webhook", (req, res) => {
  try {
    if (!global.bot) {
      console.log("⚠️ Bot missing!");
      return res.sendStatus(500);
    }
    global.bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

// Health Check
app.get("/ping", (req, res) => res.send("pong"));

// Render dynamic port
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
