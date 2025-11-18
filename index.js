// ===============================
//  Sindhu Airdrop – index.js
// ===============================

const TelegramBot = require("node-telegram-bot-api");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ------------------------------
// DEBUG LOGS
// ------------------------------

console.log("== DEBUG START ==");
console.log("BOT_TOKEN =", process.env.BOT_TOKEN);
console.log("WEBAPP_URL =", process.env.WEBAPP_URL);
console.log("ADMIN_ID =", process.env.ADMIN_ID);
console.log("BOT_USERNAME =", process.env.BOT_USERNAME);

// ENV CHECK
if (!process.env.BOT_TOKEN) { console.log("❌ ERROR: missing BOT_TOKEN"); process.exit(1); }
if (!process.env.WEBAPP_URL) { console.log("❌ ERROR: missing WEBAPP_URL"); process.exit(1); }
if (!process.env.BOT_USERNAME) { console.log("❌ ERROR: missing BOT_USERNAME"); process.exit(1); }

console.log("ENV LOADED OK");

// ------------------------------
// BOT INITIALIZE (WEBHOOK MODE)
// ------------------------------

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

const bot = new TelegramBot(TOKEN, { polling: false });
global.bot = bot;

// ------------------------------
// DATABASE SETUP
// ------------------------------

const db = new sqlite3.Database("database.sqlite");

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  wallet TEXT,
  coins INTEGER DEFAULT 0,
  daily_taps INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  joined_date TEXT
)
`);

// GET OR CREATE USER
function getUser(id, cb) {
  db.get("SELECT * FROM users WHERE id=?", [id], (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO users (id, coins, daily_taps, total_referrals, joined_date) VALUES (?, 0, 0, 0, datetime('now'))",
        [id],
        () => cb({ id, coins: 0, daily_taps: 0, total_referrals: 0 })
      );
    } else {
      cb(row);
    }
  });
}

// ------------------------------
// /start HANDLER
// ------------------------------

bot.onText(/\/start(.*)?/, async (msg, match) => {
  const userId = msg.from.id;
  const ref = match[1]?.replace(" ", "").replace("=", "");

  // Save referral if not the same user
  if (ref && ref !== "" && ref !== userId.toString()) {
    db.run(
      "UPDATE users SET total_referrals = total_referrals + 1 WHERE id=?",
      [ref]
    );
  }

  bot.sendMessage(userId, "🔥 Welcome to Sindhu Airdrop!", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🪙 Press to Earn", web_app: { url: WEBAPP_URL } }],
        [{ text: "🏆 Leaderboard", web_app: { url: WEBAPP_URL + "/leaderboard.html" } }],
        [{ text: "🎁 Referral", web_app: { url: WEBAPP_URL + "/referral.html" } }],
        [{ text: "💰 Wallet", callback_data: "wallet" }]
      ]
    }
  });
});

// ------------------------------
// WEBAPP TAP DATA
// ------------------------------

bot.on("web_app_data", (msg) => {
  const userId = msg.from.id;
  let data;

  try {
    data = JSON.parse(msg.web_app_data.data);
  } catch (e) {
    return;
  }

  const tapCount = data.taps || 0;

  db.run(
    "UPDATE users SET coins = coins + ?, daily_taps = daily_taps + ? WHERE id=?",
    [tapCount, tapCount, userId]
  );

  bot.sendMessage(userId, `🔥 +${tapCount} coins added!`);
});

// ------------------------------
// CALLBACK HANDLERS
// ------------------------------

bot.on("callback_query", (query) => {
  const userId = query.from.id;
  const action = query.data;

  if (action === "wallet") {
    bot.sendMessage(userId, "💳 Send your Polygon (0x...) wallet address");
  }
});

// ------------------------------
// SAVE WALLET
// ------------------------------

bot.on("message", (msg) => {
  if (!msg.text) return;
  if (!msg.text.startsWith("0x")) return;

  db.run("UPDATE users SET wallet=? WHERE id=?", [msg.text, msg.from.id]);
  bot.sendMessage(msg.from.id, "✅ Wallet saved!");
});

console.log("Bot fully loaded.");
console.log("Bot is running...");
