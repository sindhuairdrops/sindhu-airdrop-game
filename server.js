// ===============================
//  Sindhu Airdrop – server.js
// ===============================

require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

// Load bot FIRST
console.log("🔄 Initializing Telegram Bot...");
require("./index.js");  // This loads your bot and sets global.bot

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Telegram Webhook
app.post("/webhook", (req, res) => {
    try {
        if (global.bot) {
            global.bot.processUpdate(req.body);
        } else {
            console.log("⚠️ global.bot NOT READY");
        }
        res.sendStatus(200);
    } catch (err) {
        console.error("❌ Webhook error:", err);
        res.sendStatus(500);
    }
});

// Serve PUBLIC folder (WebApp)
app.use(express.static(path.join(__dirname, "public")));

// Admin panel routes
try {
    const adminRoutes = require("./routes/admin");
    app.use("/admin", adminRoutes);
    console.log("✅ Admin routes loaded");
} catch (err) {
    console.error("❌ Admin route load error:", err);
}

// HEALTH CHECK
app.get("/ping", (req, res) => res.send("pong"));

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
