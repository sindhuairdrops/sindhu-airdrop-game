// main.js — run bot + server together
const { spawn } = require("child_process");

const bot = spawn("node", ["index.js"], { stdio: "inherit" });
const web = spawn("node", ["server.js"], { stdio: "inherit" });

process.on("SIGINT", () => {
  bot.kill("SIGINT");
  web.kill("SIGINT");
  process.exit();
});
