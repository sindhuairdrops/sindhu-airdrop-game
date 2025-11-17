const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');  // <-- MUST COME BEFORE USING path
const fs = require('fs');

// Correct DB file (sindhu.db)
const db = new sqlite3.Database(path.join(__dirname, '..', 'sindhu.db'));

// Admin password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Jesh@5999R';

// Simple in-memory session store
const sessions = {};

function getSid(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(/sid=([^;]+)/);
  return match ? match[1] : null;
}

function auth(req, res, next) {
  const sid = getSid(req);
  if (sid && sessions[sid]) return next();
  return res.redirect('/admin/login');
}

// Login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'login.html'));
});

// Login form submission
router.post('/login', express.urlencoded({ extended: true }), (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    const sid = Math.random().toString(36).slice(2);
    sessions[sid] = true;
    res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly`);
    return res.redirect('/admin');
  }
  res.send("❌ Wrong password");
});

// Admin dashboard
router.get('/', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// Dashboard stats API
router.get('/api/stats', auth, (req, res) => {
  db.get(
    'SELECT COUNT(*) AS users, SUM(coins) AS tokens, SUM(total_referrals) AS referrals FROM users',
    (err, row) => {
      if (err) return res.json({ users: 0, tokens: 0, referrals: 0 });
      res.json(row);
    }
  );
});

// User list
router.get('/users', auth, (req, res) => {
  db.all(
    'SELECT id, wallet, coins, daily_taps, total_referrals, joined_date FROM users ORDER BY coins DESC',
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});

// Scrolling message save
router.post('/message', auth, express.urlencoded({ extended: true }), (req, res) => {
  fs.writeFileSync('admin_message.txt', req.body.message || '');
  res.send('OK');
});

// Get message
router.get('/message', auth, (req, res) => {
  const msg = fs.existsSync('admin_message.txt')
    ? fs.readFileSync('admin_message.txt', 'utf8')
    : '';
  res.send(msg);
});

// Download CSV report
router.get('/report', auth, (req, res) => {
  db.all('SELECT id,wallet,coins,total_referrals,joined_date FROM users', (err, rows) => {
    if (err) return res.status(500).send('Error generating report.');

    let csv = 'user_id,wallet,coins,total_referrals,joined_date\n';
    rows.forEach(u => {
      csv += `${u.id},${u.wallet || ''},${u.coins || 0},${u.total_referrals || 0},${u.joined_date || ''}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users_report.csv");
    res.send(csv);
  });
});

module.exports = router;
