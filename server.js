// TELEGRAM WEBHOOK HANDLER
app.post("/webhook", (req, res) => {
  try {
    if (global.bot && req.body) {
      console.log("📥 Webhook update received.");
      global.bot.processUpdate(req.body);
      return res.status(200).send("OK");
    }

    console.log("⚠️ Bot not ready yet, skipping update...");
    return res.status(200).send("OK");   // IMPORTANT: NEVER 500
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(200).send("OK");   // IMPORTANT: NEVER 500
  }
});
