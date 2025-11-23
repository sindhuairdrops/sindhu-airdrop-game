// ===============================
//  Sindhu Airdrop – main.js
// ===============================

console.log("== STARTING APPLICATION ==");

require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

console.log("Loading bot...");

// ---------------------------------------
// INIT BOT FIRST
// ---------------------------------------

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
global.bot = bot;

// Load bot logic (index.js)
require("./index");

// ---------------------------------------
// EXPRESS SERVER START
// ---------------------------------------

console.log("Starting server...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC PUBLIC FILES
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------
// ADMIN ROUTES
// ---------------------------------------

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
        return res.sendStatus(200);
    } catch (err) {
        console.error("Webhook processing error:", err);
        return res.sendStatus(500);
    }
});

// ---------------------------------------
// API: USER INFO FOR TAP GAME
// ---------------------------------------

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"));

app.get("/api/userinfo", (req, res) => {
    const userId = req.query.id;

    if (!userId) return res.json({ total: 0, today: 0, message: "" });

    db.get(
        "SELECT coins, daily_taps FROM users WHERE id=?",
        [userId],
        (err, row) => {
            let msg = "";
            try {
                msg = fs.readFileSync("admin_message.txt", "utf8");
            } catch {}

            res.json({
                total: row?.coins || 0,
                today: row?.daily_taps || 0,
                message: msg
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
    console.log("==========================================");
    console.log(" Available at:", process.env.WEBAPP_URL);
    console.log("==========================================");
});
