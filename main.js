// main.js — start bot first, then server

const { spawn } = require("child_process");

console.log("Starting Telegram bot first...");

const bot = spawn("node", ["index.js"], { stdio: "inherit" });

bot.on("close", (code) => {
  console.error("Bot exited with code", code);
});

// Delay server launch slightly so global.bot is ready
setTimeout(() => {
  console.log("Starting server...");
  const web = spawn("node", ["server.js"], { stdio: "inherit" });

  web.on("close", (code) => {
    console.error("Server exited with code", code);
  });
}, 2000); // 2 seconds

