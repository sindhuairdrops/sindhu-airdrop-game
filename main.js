// ===============================
//  Sindhu Airdrop – main.js
// ===============================

console.log("== STARTING APPLICATION ==");

require("dotenv").config();

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const TelegramBot = require("node-telegram-bot-api");

// ---------------------------------------
// INIT BOT FIRST
// ---------------------------------------

console.log("Loading bot...");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
global.bot = bot;

// Load bot handlers (index.js)
require("./index");

// ---------------------------------------
// DATABASE
// ---------------------------------------

const db = new sqlite3.Database("database.sqlite");

// ---------------------------------------
// EXPRESS SERVER
// ---------------------------------------

console.log("Starting server...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// ADMIN ROUTES
try {
    const adminRoutes = require("./routes/admin");
    app.use("/admin", adminRoutes);
    console.log("Admin routes loaded.");
} catch (err) {
    console.error("Admin route error:", err);
}

// ---------------------------------------
// WEBHOOK ENDPOINT
// ---------------------------------------

app.post("/webhook", (req, res) => {
    try {
        global.bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error("Webhook processing error:", err);
        res.sendStatus(500);
    }
});

// ---------------------------------------
// USER STATS API (For Tap Game)
// ---------------------------------------

app.get("/api/userstats", (req, res) => {
    const id = req.query.id;

    if (!id) return res.json({ total: 0, today: 0 });

    db.get(
        "SELECT coins, daily_taps FROM users WHERE id = ?",
        [id],
        (err, row) => {
            if (err || !row) {
                return res.json({ total: 0, today: 0 });
            }

            res.json({
                total: row.coins || 0,
                today: row.daily_taps || 0
            });
        }
    );
});

// ---------------------------------------
// HEALTH CHECK
// ---------------------------------------

app.get("/ping", (req, res) => res.send("pong"));

// ---------------------------------------
// START SERVER
// ---------------------------------------

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});
