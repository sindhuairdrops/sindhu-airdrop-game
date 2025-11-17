// ===============================
//  Sindhu Airdrop – index.js
// ===============================

const TelegramBot = require("node-telegram-bot-api");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// DEBUG
console.log("== DEBUG START ==");
console.log("BOT_TOKEN =", process.env.BOT_TOKEN);
console.log("WEBAPP_URL =", process.env.WEBAPP_URL);
console.log("ADMIN_ID =", process.env.ADMIN_ID);

// ENV CHECK
if (!process.env.BOT_TOKEN) { console.log("ERROR: missing BOT_TOKEN"); process.exit(1); }
if (!process.env.WEBAPP_URL) { console.log("ERROR: missing WEBAPP_URL"); process.exit(1); }

console.log("ENV LOADED OK");

// LOAD ENV
const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

// BOT INITIALIZE (WEBHOOK MODE)
const bot = new TelegramBot(TOKEN, { polling: false });
global.bot = bot;

// SET WEBHOOK
bot.setWebHook(`${WEBAPP_URL}/webhook`)
  .then(() => console.log("Webhook set successfully."))
  .catch(err => console.error("Webhook error:", err));

// ===============================
//  DATABASE
// ===============================

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
    } else cb(row);
  });
}

// ===============================
//  COMMAND: /start
// ===============================

bot.onText(/\/start(.*)?/, async (msg, match) => {
  const userId = msg.from.id;

  getUser(userId, () => {
    bot.sendMessage(userId, "🔥 Welcome to Sindhu Airdrop!", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🪙 Press to Earn", web_app: { url: WEBAPP_URL } }],
          [{ text: "🏆 Leaderboard", callback_data: "leaderboard" }],
          [{ text: "🎁 Referral", callback_data: "referral" }],
          [{ text: "💰 Wallet", callback_data: "wallet" }]
        ]
      }
    });
  });
});

// ===============================
//  WEBAPP DATA (tap events)
// ===============================

bot.on("web_app_data", (msg) => {
  const userId = msg.from.id;
  const data = JSON.parse(msg.web_app_data.data);
  const tapCount = data.taps;

  db.run(
    "UPDATE users SET coins = coins + ?, daily_taps = daily_taps + ? WHERE id=?",
    [tapCount, tapCount, userId]
  );

  bot.sendMessage(userId, `🔥 +${tapCount} coins earned!`);
});

// ===============================
// CALLBACK BUTTON HANDLERS
// ===============================

bot.on("callback_query", (query) => {
  const userId = query.from.id;
  const action = query.data;

  if (action === "leaderboard") {
    db.all(
      "SELECT id, coins FROM users ORDER BY coins DESC LIMIT 10",
      (err, rows) => {
        let s = "🏆 Top Players:\n\n";
        rows.forEach((u, i) => (s += `${i + 1}. User ${u.id} — ${u.coins} 🪙\n`));
        bot.sendMessage(userId, s);
      }
    );
  }

  if (action === "referral") {
    bot.sendMessage(
      userId,
      `👥 Invite link:\nhttps://t.me/${process.env.BOT_USERNAME}?start=${userId}`
    );
  }

  if (action === "wallet") {
    bot.sendMessage(userId, "💳 Send your Polygon wallet (starts with 0x)");
  }
});

// SAVE WALLET
bot.on("message", (msg) => {
  if (!msg.text.startsWith("0x")) return;

  db.run("UPDATE users SET wallet=? WHERE id=?", [msg.text, msg.from.id]);
  bot.sendMessage(msg.from.id, "✅ Wallet saved!");
});

console.log("Bot fully loaded.");
