// ===============================
//  Sindhu Airdrop – index.js
// ===============================

// Bot object from main.js
const bot = global.bot;

const sqlite3 = require("sqlite3").verbose();

console.log("== INDEX.JS LOADED ==");

// DATABASE -----------------------------------

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

// START COMMAND --------------------------------

bot.onText(/\/start(.*)?/, (msg, match) => {
  console.log("🔥 /start TRIGGERED");

  const userId = msg.from.id;
  const ref = (match[1] || "").replace("=", "").trim();

  getUser(userId, () => {
    if (ref && ref !== "" && ref !== userId.toString()) {
      db.run("UPDATE users SET total_referrals = total_referrals + 1 WHERE id=?", [ref]);
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

// TAP EVENTS -----------------------------------

bot.on("web_app_data", (msg) => {
  const userId = msg.from.id;

  try {
    const data = JSON.parse(msg.web_app_data.data);
    const taps = data.taps || 0;

    db.run("UPDATE users SET coins = coins + ?, daily_taps = daily_taps + ? WHERE id=?",
      [taps, taps, userId]
    );

    bot.sendMessage(userId, `🔥 +${taps} coins added!`);
  } catch (err) {}
});

// CALLBACK BUTTONS -----------------------------

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
    bot.sendMessage(userId, `👥 Referral Link:\nhttps://t.me/${process.env.BOT_USERNAME}?start=${userId}`);
  }

  if (action === "wallet") {
    bot.sendMessage(userId, "💳 Send your Polygon wallet address (0x...)");
  }
});

// WALLET --------------------------------------

bot.on("message", (msg) => {
  if (!msg.text) return;
  if (msg.text.startsWith("/")) return;

  if (msg.text.startsWith("0x")) {
    db.run("UPDATE users SET wallet=? WHERE id=?", [msg.text, msg.from.id]);
    bot.sendMessage(msg.from.id, "✅ Wallet saved!");
  }
});

console.log("Bot logic loaded.");
