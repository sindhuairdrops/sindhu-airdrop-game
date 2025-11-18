// Telegram WebApp API
const tg = window.Telegram.WebApp;
tg.expand();

// ---------- GAME VARIABLES ----------
let taps = 0;
let energy = 50;

const tapDisplay = document.getElementById("taps");
const energyDisplay = document.getElementById("energy");
const tapSound = document.getElementById("tapSound");
const coin = document.getElementById("coin");

function updateStats() {
    tapDisplay.textContent = taps;
    energyDisplay.textContent = energy;
}

// ---------- TAP HANDLER ----------
coin.addEventListener("click", () => {
    if (energy <= 0) return;

    taps++;
    energy--;

    updateStats();

    tapSound.currentTime = 0;
    tapSound.play().catch(() => {});

    // Send data to bot
    tg.sendData(JSON.stringify({
        event: "tap",
        taps: 1
    }));
});

// ---------- ENERGY REFILL EVERY 20 SEC ----------
setInterval(() => {
    if (energy < 50) {
        energy++;
        updateStats();
    }
}, 20000);

// Ready
console.log("Sindhu Tap Game Loaded.");
