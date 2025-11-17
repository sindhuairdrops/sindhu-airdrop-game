// ===============================
//  Sindhu Airdrop - SERVER.JS
// ===============================

// DEBUG START
console.log("== SERVER DEBUG START ==");

const express = require("express");
const path = require("path");

console.log("Loading Express...");
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// PUBLIC STATIC FOLDER
console.log("Setting public folder...");
const publicPath = path.join(__dirname, "public");
console.log("Public path:", publicPath);

app.use(express.static(publicPath));

// ADMIN ROUTES
console.log("Loading admin routes...");
try {
  const adminRoutes = require("./routes/admin");
  app.use("/admin", adminRoutes);
  console.log("Admin routes loaded successfully.");
} catch (err) {
  console.error("❌ ERROR loading admin routes:", err);
}

// TELEGRAM WEBHOOK HANDLER
app.post("/webhook", (req, res) => {
  try {
    if (global.bot && req.body) {
      global.bot.processUpdate(req.body);
      return res.sendStatus(200);
    }
    console.log("⚠️ Webhook received but bot not ready!");
    res.sendStatus(500);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(500);
  }
});

// HEALTH CHECK
app.get("/ping", (req, res) => res.send("pong"));

// START SERVER
const PORT = process.env.PORT || 3000;

console.log("About to start server on port:", PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// server.js — FULL CODE FROM CANVAS OMITTED
// Please paste full server.js content from Canvas.
