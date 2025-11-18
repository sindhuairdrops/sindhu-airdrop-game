const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const db = new sqlite3.Database(path.join(__dirname, "..", "database.sqlite"));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Jesh@5999R";

// Simple session
const sessions = {};

function getSid(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(/sid=([^;]+)/);
  return match ? match[1] : null;
}

function auth(req, res, next) {
  const sid = getSid(req);
  if (sid && sessions[sid]) return next();
  return res.redirect("/admin/login");
}

// Login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin", "login.html"));
});

// POST login
router.post("/login", express.urlencoded({ extended: true }), (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    const sid = Math.random().toString(36).slice(2);
    sessions[sid] = true;
    res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly`);
    return res.redirect("/admin");
  }
  res.send("❌ Wrong password");
});

// Dashboard
router.get("/", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin", "index.html"));
});

// Stats API
router.get("/api/stats", auth, (req, res) => {
  db.get(
    "SELECT COUNT(*) AS users, SUM(coins) AS tokens, SUM(total_referrals) AS referrals FROM users",
    (err, row) => res.json(row || {})
  );
});

// User list
router.get("/users", auth, (req, res) => {
  db.all(
    "SELECT id, wallet, coins, total_referrals, joined_date FROM users ORDER BY coins DESC",
    (err, rows) => res.json(rows || [])
  );
});

// Save scrolling message
router.post("/message", auth, express.urlencoded({ extended: true }), (req, res) => {
  fs.writeFileSync("admin_message.txt", req.body.message || "");
  res.send("OK");
});

// Get scrolling message
router.get("/message", auth, (req, res) => {
  const msg = fs.existsSync("admin_message.txt")
    ? fs.readFileSync("admin_message.txt", "utf8")
    : "";
  res.send(msg);
});

// CSV Download
router.get("/report", auth, (req, res) => {
  db.all(
    "SELECT id, wallet, coins, total_referrals, joined_date FROM users",
    (err, rows) => {
      if (err) return res.status(500).send("Error generating report");

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

module.exports = router;
