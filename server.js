// TELEGRAM WEBHOOK HANDLER (NO 500 ERRORS EVER)
app.post("/webhook", (req, res) => {
  try {
    if (!global.bot) {
      console.log("⚠️ Bot not ready yet, skipping update...");
      return res.status(200).send("OK");
    }

    console.log("📥 Webhook update received.");
    global.bot.processUpdate(req.body);

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(200).send("OK");
  }
});
