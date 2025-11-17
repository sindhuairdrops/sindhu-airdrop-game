// ===============================
//  Sindhu Airdrop - SERVER.JS
// ===============================

console.log("== SERVER DEBUG START ==");

const express = require("express");
const path = require("path");
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// PUBLIC FOLDER
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
    if (!global.bot) {
      console.log("⚠️ Bot not ready yet, skipping update...");
      return res.status(200).send("OK");  // Never return 500!
    }

    console.log("📥 Webhook update received.");
    global.bot.processUpdate(req.body);
    return res.status(200).send("OK");

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(200).send("OK");
  }
});

// HEALTH CHECK
app.get("/ping", (req, res) => res.send("pong"));

// START SERVER
const PORT = process.env.PORT || 10000;

console.log("About to start server on port:", PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
