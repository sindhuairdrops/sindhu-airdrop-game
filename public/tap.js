const tg = window.Telegram.WebApp;
tg.expand();

let soundEnabled = false;

document.addEventListener("click", () => soundEnabled = true, { once: true });

const tapButton = document.getElementById("tapButton");
const totalCoins = document.getElementById("totalCoins");
const todayCoins = document.getElementById("todayCoins");
const tapSound = document.getElementById("tapSound");

// Load Initial Stats
fetch("/api/userinfo")
    .then(res => res.json())
    .then(data => {
        totalCoins.textContent = data.total || 0;
        todayCoins.textContent = data.today || 0;
        document.getElementById("scrollingMessage").textContent = data.message || "";
    });

// Tap Action
tapButton.addEventListener("click", () => {
    if (soundEnabled) {
        tapSound.currentTime = 0;
        tapSound.play().catch(() => {});
    }

    todayCoins.textContent = Number(todayCoins.textContent) + 1;
    totalCoins.textContent = Number(totalCoins.textContent) + 1;

    tg.sendData(JSON.stringify({ taps: 1 }));
});
