// ===============================
//  Sindhu Airdrop – main.js
// ===============================

console.log("== STARTING APPLICATION ==");

require("dotenv").config();

const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

// ---------------------------------------
// INIT BOT BEFORE ANYTHING
// ---------------------------------------

console.log("Loading bot...");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
global.bot = bot;

// Load bot handlers
require("./index");   // <--- LOAD BOT CODE

// ---------------------------------------
// START EXPRESS SERVER
// ---------------------------------------

console.log("Starting server...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC PUBLIC FILES
app.use(express.static(path.join(__dirname, "public")));

// ADMIN ROUTES
try {
  const adminRoutes = require("./routes/admin");
  app.use("/admin", adminRoutes);
  console.log("Admin routes loaded.");
} catch (err) {
  console.error("Admin route error:", err);
}

// WEBHOOK ENDPOINT (VERY IMPORTANT)
app.post("/webhook", (req, res) => {
  try {
    global.bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.sendStatus(500);
  }
});

// HEALTH CHECK
app.get("/ping", (req, res) => res.send("pong"));

// START SERVER
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
