// Telegram WebApp API
const tg = window.Telegram.WebApp;
tg.expand();

// Elements
const tapButton = document.getElementById("tapButton");
const totalCoinsEl = document.getElementById("totalCoins");
const todayCoinsEl = document.getElementById("todayCoins");
const scrollingMessage = document.getElementById("scrollingMessage");
const tapSound = document.getElementById("tapSound");

// Unlock sound on first touch
let soundEnabled = false;
document.body.addEventListener("click", () => soundEnabled = true, { once: true });

function playSound() {
    if (!soundEnabled) return;
    tapSound.currentTime = 0;
    tapSound.play().catch(() => {});
}

/* ----------------------------
   LOAD INITIAL USER STATS
----------------------------- */
async function loadStats() {
    try {
        let res = await fetch("/api/user-stats");
        let data = await res.json();

        animateNumber(totalCoinsEl, data.total || 0);
        animateNumber(todayCoinsEl, data.today || 0);
    } catch (e) {
        console.log("Stats load error:", e);
    }
}

/* ----------------------------
   LOAD ADMIN SCROLL MESSAGE
----------------------------- */
async function loadScrollMessage() {
    let msg = await fetch("/admin/message").then(r => r.text());
    scrollingMessage.textContent = msg || "Welcome to Sindhu Airdrop!";
}

/* ----------------------------
   NUMBER ANIMATION
----------------------------- */
function animateNumber(elm, newValue) {
    let old = parseInt(elm.textContent);
    let duration = 300;
    let startTime = performance.now();

    function update(t) {
        let progress = Math.min((t - startTime) / duration, 1);
        elm.textContent = Math.floor(old + (newValue - old) * progress);

        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ----------------------------
   TAP HANDLER
----------------------------- */
tapButton.addEventListener("click", () => {
    playSound();
    if (navigator.vibrate) navigator.vibrate(40);

    // Pulse animation
    tapButton.style.transform = "scale(0.9)";
    setTimeout(() => tapButton.style.transform = "scale(1)", 100);

    tg.sendData(JSON.stringify({ taps: 1 }));

    todayCoinsEl.textContent = parseInt(todayCoinsEl.textContent) + 1;
    totalCoinsEl.textContent = parseInt(totalCoinsEl.textContent) + 1;
});

/* ----------------------------
   NAVIGATION BUTTONS
----------------------------- */
document.getElementById("buyBtn").onclick = () => {
    window.open("https://quickswap.exchange", "_blank");
};

document.getElementById("priceBtn").onclick = () => {
    window.open("https://www.geckoterminal.com", "_blank");
};

/* ----------------------------
   INIT
----------------------------- */
loadStats();
loadScrollMessage();
