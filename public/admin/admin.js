const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const db = new sqlite3.Database(path.join(__dirname, "..", "database.sqlite"));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Jesh@5999R";

// Simple session store
const sessions = {};

function getSid(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(/sid=([^;]+)/);
  return match ? match[1] : null;
}

function auth(req, res, next) {
  const sid = getSid(req);
  if (sid && sessions[sid]) return next();
  res.redirect("/admin/login");
}

// ============================
// LOGIN PAGE
// ============================
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin", "login.html"));
});

// ============================
// LOGIN POST
// ============================
router.post("/login", express.urlencoded({ extended: true }), (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    const sid = Math.random().toString(36).slice(2);
    sessions[sid] = true;
    res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly`);
    return res.redirect("/admin");
  }
  res.send("❌ Wrong password");
});

// ============================
// ADMIN DASHBOARD
// ============================
router.get("/", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin", "index.html"));
});

// ============================
// API: STATS
// ============================
router.get("/api/stats", auth, (req, res) => {
  db.get(
    "SELECT COUNT(*) AS users, SUM(coins) AS tokens, SUM(total_referrals) AS referrals FROM users",
    (err, row) => res.json(row || {})
  );
});

// ============================
// API: USER LIST
// ============================
router.get("/users", auth, (req, res) => {
  db.all(
    "SELECT id, wallet, coins, total_referrals, joined_date FROM users ORDER BY coins DESC",
    (err, rows) => res.json(rows || [])
  );
});

// ============================
// SAVE SCROLLING MESSAGE
// ============================
router.post("/message", auth, express.urlencoded({ extended: true }), (req, res) => {
  fs.writeFileSync("admin_message.txt", req.body.message || "");
  res.send("OK");
});

// LOAD SCROLLING MESSAGE
router.get("/message", auth, (req, res) => {
  const msg = fs.existsSync("admin_message.txt")
    ? fs.readFileSync("admin_message.txt", "utf8")
    : "";
  res.send(msg);
});

// ============================
// EXPORT CSV REPORT
// ============================
router.get("/report", auth, (req, res) => {
  db.all(
    "SELECT id, wallet, coins, total_referrals, joined_date FROM users",
    (err, rows) => {
      if (err) return res.status(500).send("Error");

      let csv = "user_id,wallet,coins,total_referrals,joined_date\n";
      rows.forEach(u => {
        csv += `${u.id},${u.wallet || ""},${u.coins},${u.total_referrals},${u.joined_date}\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=sindhu_airdrop_users.csv");

      res.send(csv);
    }
  );
});

// ============================
// BROADCAST MESSAGE TO USERS
// ============================
router.post("/broadcast", auth, express.json(), (req, res) => {
  const message = req.body.message;
  if (!message) return res.send("❌ Message empty");

  db.all("SELECT id FROM users", async (err, rows) => {
    if (err) return res.send("Error fetching users");

    let count = 0;

    for (const u of rows) {
      try {
        await global.bot.sendMessage(u.id, message);
        count++;
        await new Promise(r => setTimeout(r, 40)); // Flood control
      } catch (e) {}
    }

    res.send(`✅ Message sent to ${count} users`);
  });
});

module.exports = router;
