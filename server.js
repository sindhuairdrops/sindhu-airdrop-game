const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const bot = require("./index.js"); // → IMPORTANT

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Webhook handler (REQUIRED)
app.post("/webhook", (req, res) => {
    global.bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Admin routes
app.use("/admin", require("./routes/admin"));

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("🔥 Server running on port", PORT);
});

