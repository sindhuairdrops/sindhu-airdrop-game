// ===============================
//  Sindhu Airdrop – index.js
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

if (!process.env.BOT_TOKEN) process.exit(console.log("❌ Missing BOT_TOKEN"));
if (!process.env.WEBAPP_URL) process.exit(console.log("❌ Missing WEBAPP_URL"));
if (!process.env.BOT_USERNAME) process.exit(console.log("❌ Missing BOT_USERNAME"));

console.log("ENV LOADED OK");

// ------------------------------
// BOT INITIALIZE
// ------------------------------
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
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
  last_tap_date TEXT,
  total_referrals INTEGER DEFAULT 0,
  joined_date TEXT
)
`);

// Create or fetch user
function getUser(id, cb) {
  const today = new Date().toLocaleDateString();

  db.get("SELECT * FROM users WHERE id=?", [id], (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO users (id, coins, daily_taps, last_tap_date, total_referrals, joined_date)
         VALUES (?, 0, 0, ?, 0, datetime('now'))`,
        [id, today],
        () => cb({
          id, coins: 0, daily_taps: 0, last_tap_date: today, total_referrals: 0
        })
      );
    } else {
      // Daily reset
      if (row.last_tap_date !== today) {
        db.run("UPDATE users SET daily_taps=0, last_tap_date=? WHERE id=?", [today, id]);
        row.daily_taps = 0;
        row.last_tap_date = today;
      }
      cb(row);
    }
  });
}

// ------------------------------
// /start COMMAND
// ------------------------------
bot.onText(/\/start(.*)?/, (msg, match) => {
  const userId = msg.from.id;
  const ref = (match[1] || "").replace("=", "").trim();

  getUser(userId, user => {
    // Referral Bonus
    if (ref && ref !== userId.toString()) {
      db.run(
        "UPDATE users SET total_referrals = total_referrals + 1, coins = coins + 500 WHERE id=?",
        [ref]
      );
    }

    bot.sendMessage(userId, "🔥 Welcome to Sindhu Airdrop!", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🪙 Press to Earn", web_app: { url: process.env.WEBAPP_URL } }],
          [{ text: "🏆 Leaderboard", callback_data: "leaderboard" }],
          [{ text: "🎁 Referral", callback_data: "referral" }],
          [{ text: "💰 Wallet", callback_data: "wallet" }]
        ]
      }
    });
  });
});

// ------------------------------
// HANDLE TAP FROM WEBAPP
// ------------------------------
bot.on("web_app_data", (msg) => {
  const userId = msg.from.id;

  let data;
  try { data = JSON.parse(msg.web_app_data.data); }
  catch { return; }

  const taps = data.taps || 0;
  const today = new Date().toLocaleDateString();

  getUser(userId, user => {
    if (data.daily_bonus === 100) {
      db.run("UPDATE users SET coins = coins + 100 WHERE id=?", [userId]);
      bot.sendMessage(userId, "🎉 Daily Login Bonus +100!");
      return;
    }

    if (user.daily_taps >= 200) {
      bot.sendMessage(userId, "⚠️ Daily limit reached (200).");
      return;
    }

    const allowed = Math.min(taps, 200 - user.daily_taps);

    db.run(
      "UPDATE users SET coins = coins + ?, daily_taps = daily_taps + ?, last_tap_date=? WHERE id=?",
      [allowed, allowed, today, userId]
    );

    bot.sendMessage(userId, `🔥 +${allowed} coins added!`);
  });
});

// ------------------------------
// BUTTON HANDLERS
// ------------------------------
bot.on("callback_query", (q) => {
  const userId = q.from.id;

  bot.answerCallbackQuery(q.id);

  if (q.data === "leaderboard") {
    db.all("SELECT id, coins FROM users ORDER BY coins DESC LIMIT 10", (err, rows) => {
      let txt = "🏆 Top Players:\n\n";
      rows.forEach((u, i) => {
        txt += `${i + 1}. User ${u.id} — ${u.coins} 🪙\n`;
      });
      bot.sendMessage(userId, txt);
    });
  }

  if (q.data === "referral") {
    bot.sendMessage(
      userId,
      `👥 Invite & Earn:\nhttps://t.me/${process.env.BOT_USERNAME}?start=${userId}`
    );
  }

  if (q.data === "wallet") {
    bot.sendMessage(userId, "💳 Send your Polygon wallet (0x...)");
  }
});

// ------------------------------
// WALLET SAVE
// ------------------------------
bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  if (msg.text.startsWith("0x")) {
    db.run("UPDATE users SET wallet=? WHERE id=?", [msg.text, msg.from.id]);
    bot.sendMessage(msg.from.id, "✅ Wallet saved!");
  }
});

console.log("Bot fully loaded.");
