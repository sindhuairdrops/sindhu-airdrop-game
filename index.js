console.log("== DEBUG START ==");

console.log("BOT_TOKEN =", process.env.BOT_TOKEN);
console.log("WEBAPP_URL =", process.env.WEBAPP_URL);
console.log("ADMIN_ID =", process.env.ADMIN_ID);

if (!process.env.BOT_TOKEN) {
  console.log("ERROR: BOT_TOKEN missing");
  process.exit(1);
}
if (!process.env.WEBAPP_URL) {
  console.log("ERROR: WEBAPP_URL missing");
  process.exit(1);
}

console.log("ENV LOADED OK");
// index.js — FULL CODE FROM CANVAS OMITTED DUE TO LENGTH LIMITS
// Please paste the full index.js content from the Canvas doc here.
