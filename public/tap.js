// --------------------------------------
// Telegram WebApp API Init
// --------------------------------------
const tg = window.Telegram.WebApp;
tg.expand();

// Elements
const tapButton = document.getElementById("tapButton");
const coinsDisplay = document.getElementById("coins");
const tapSound = document.getElementById("tapSound");

// Telegram sound unlock
let soundEnabled = false;

document.addEventListener("click", () => {
    soundEnabled = true;
}, { once: true });

function playSound() {
    if (!soundEnabled) return;
    tapSound.currentTime = 0;
    tapSound.play().catch(() => {});
}

let coins = 0;

// Smooth animation counter
function animateCoins(newCoins) {
    let start = coins;
    let end = newCoins;
    let duration = 200;
    let startTime = performance.now();

    function update(time) {
        let progress = Math.min((time - startTime) / duration, 1);
        coinsDisplay.textContent = Math.floor(start + (end - start) * progress);
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

tapButton.addEventListener("click", () => {
    coins++;
    animateCoins(coins);
    playSound();

    if (navigator.vibrate) navigator.vibrate(40);

    tg.sendData(JSON.stringify({ taps: 1 }));
});
