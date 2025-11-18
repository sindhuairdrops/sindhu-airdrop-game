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

// ENV CHECK
if (!process.env.BOT_TOKEN) process.exit(console.log("❌ Missing BOT_TOKEN"));
if (!process.env.WEBAPP_URL) process.exit(console.log("❌ Missing WEBAPP_URL"));
if (!process.env.BOT_USERNAME) process.exit(console.log("❌ Missing BOT_USERNAME"));

console.log("ENV LOADED OK");

// ------------------------------
// BOT INITIALIZE (WEBHOOK MODE)
// ------------------------------

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

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
  joined_date TEXT,
  last_login TEXT
)
`);

// GET USER OR CREATE
function getUser(id, cb) {
  db.get("SELECT * FROM users WHERE id=?", [id], (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO users (id, coins, daily_taps, total_referrals, joined_date, last_login) VALUES (?, 0, 0, 0, datetime('now'), NULL)",
        [id],
        () => cb({ id, coins: 0, daily_taps: 0, total_referrals: 0 })
      );
    } else cb(row);
  });
}

// ------------------------------
//  /start COMMAND
// ------------------------------

bot.onText(/\/start(.*)?/, (msg, match) => {
  console.log("🔥 /start TRIGGERED");

  const userId = msg.from.id;
  const ref = (match[1] || "").replace("=", "").trim();

  getUser(userId, () => {

    // ------------------------------
    // DAILY LOGIN BONUS +100
    // ------------------------------
    db.get("SELECT last_login FROM users WHERE id=?", [userId], (err, row) => {
      const today = new Date().toISOString().slice(0, 10);

      if (!row.last_login || row.last_login !== today) {
        db.run("UPDATE users SET coins = coins + 100, last_login=? WHERE id=?", 
          [today, userId]
        );
        bot.sendMessage(userId, "🎉 Daily Login Bonus: +100 coins!");
      }
    });

    // ------------------------------
    // REFERRAL BONUS +500
    // ------------------------------
    if (ref && ref !== "" && ref !== userId.toString()) {
      db.run(
        "UPDATE users SET coins = coins + 500, total_referrals = total_referrals + 1 WHERE id=?",
        [ref]
      );
      bot.sendMessage(ref, "🎉 You earned +500 coins from a referral!");
    }

    // MAIN MENU
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
// TAP HANDLER (WEB APP DATA)
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
  const DAILY_LIMIT = 200;

  db.get("SELECT daily_taps, coins FROM users WHERE id=?", [userId], (err, row) => {

    const current = row.daily_taps || 0;

    if (current >= DAILY_LIMIT) {
      bot.sendMessage(userId, "⛔ Daily tap limit reached (200). Come back tomorrow.");
      return;
    }

    const remaining = DAILY_LIMIT - current;
    const allowed = Math.min(tapCount, remaining);

    db.run("UPDATE users SET coins = coins + ?, daily_taps = daily_taps + ? WHERE id=?", 
      [allowed, allowed, userId]
    );

    const total = row.coins + allowed;

    bot.sendMessage(
      userId,
      `🔥 +${allowed} coins!\n🏆 Total Earned: ${total}\nRemaining taps: ${remaining - allowed}`
    );
  });
});

// ------------------------------
// CALLBACK HANDLERS
// ------------------------------

bot.on("callback_query", (query) => {
  const userId = query.from.id;
  const action = query.data;

  bot.answerCallbackQuery(query.id);

  if (action === "leaderboard") {
    db.all("SELECT id, coins FROM users ORDER BY coins DESC LIMIT 10", (err, rows) => {
      let text = "🏆 Top Players:\n\n";
      rows.forEach((u, i) => {
        text += `${i+1}. User ${u.id} — ${u.coins}🪙\n`;
      });
      bot.sendMessage(userId, text);
    });
  }

  if (action === "referral") {
    bot.sendMessage(
      userId,
      `👥 Referral Link:\nhttps://t.me/${process.env.BOT_USERNAME}?start=${userId}`
    );
  }

  if (action === "wallet") {
    bot.sendMessage(userId, "💳 Send your Polygon wallet (starts with 0x)");
  }
});

// ------------------------------
// MESSAGE HANDLER (WALLET)
// ------------------------------

bot.on("message", (msg) => {
  if (!msg.text) return;
  if (msg.text.startsWith("/")) return;

  if (msg.text.startsWith("0x")) {
    db.run("UPDATE users SET wallet=? WHERE id=?", [msg.text, msg.from.id]);
    bot.sendMessage(msg.from.id, "✅ Wallet saved!");
  }
});

console.log("Bot fully loaded.");
