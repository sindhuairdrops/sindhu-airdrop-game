// ===============================
//  Sindhu Airdrop – index.js (FIXED)
// ===============================

const TelegramBot = require("node-telegram-bot-api");
const sqlite3 = require("sqlite3").verbose();

// ------------------------------
// DEBUG LOGS
// ------------------------------

console.log("== DEBUG START ==");
console.log("BOT_TOKEN =", process.env.BOT_TOKEN);
console.log("WEBAPP_URL =", process.env.WEBAPP_URL);
console.log("BOT_USERNAME =", process.env.BOT_USERNAME);

if (!process.env.BOT_TOKEN) process.exit(1);
if (!process.env.WEBAPP_URL) process.exit(1);
if (!process.env.BOT_USERNAME) process.exit(1);

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

// ------------------------------
// BOT INITIALIZE (WEBHOOK)
// ------------------------------

const bot = new TelegramBot(TOKEN, { polling: false });
global.bot = bot;

// ------------------------------
// DATABASE
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

// ------------------------------
// /start HANDLER
// ------------------------------

bot.onText(/\/start(.*)?/, async (msg, match) => {
  const userId = msg.from.id;
  const ref = match[1]?.replace(" ", "").replace("=", "");

  // First create user
  getUser(userId, () => {
    // Then update referral
    if (ref && ref !== userId.toString()) {
      db.run(
        "UPDATE users SET total_referrals = total_referrals + 1 WHERE id=?",
        [ref]
      );
    }

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

  const taps = data.taps || 0;

  db.run(
    "UPDATE users SET coins = coins + ?, daily_taps = daily_taps + ? WHERE id=?",
    [taps, taps, userId]
  );

  bot.sendMessage(userId, `🔥 +${taps} coins added!`);
});

// ------------------------------
// CALLBACK BUTTONS
// ------------------------------

bot.on("callback_query", (query) => {
  const userId = query.from.id;

  bot.answerCallbackQuery(query.id); // IMPORTANT

  if (query.data === "leaderboard") {
    db.all(
      "SELECT id, coins FROM users ORDER BY coins DESC LIMIT 10",
      (err, rows) => {
        let txt = "🏆 Top Players:\n\n";
        rows.forEach((u, i) => {
          txt += `${i + 1}. User ${u.id} — ${u.coins} 🪙\n`;
        });
        bot.sendMessage(userId, txt);
      }
    );
  }

  if (query.data === "referral") {
    bot.sendMessage(
      userId,
      `🎁 Invite & Earn:\nhttps://t.me/${process.env.BOT_USERNAME}?start=${userId}`
    );
  }

  if (query.data === "wallet") {
    bot.sendMessage(userId, "💳 Send your Polygon wallet (starts with 0x)");
  }
});

// ------------------------------
// WALLET HANDLER (FIXED)
// ------------------------------

bot.on("message", (msg) => {
  if (!msg.text) return;

  // Allow commands to pass
  if (msg.text.startsWith("/")) return;

  // Only accept wallet address
  if (!msg.text.startsWith("0x")) return;

  db.run("UPDATE users SET wallet=? WHERE id=?", [msg.text, msg.from.id]);
  bot.sendMessage(msg.from.id, "✅ Wallet saved!");
});

console.log("Bot fully loaded.");
console.log("Bot is running...");
