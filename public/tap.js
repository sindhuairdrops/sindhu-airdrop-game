// ------------------------------
//  Telegram WebApp Initialization
// ------------------------------
const tg = window.Telegram.WebApp;
tg.expand();

// ------------------------------
//  ELEMENTS
// ------------------------------
const tapButton = document.getElementById("tapButton");
const coinsDisplay = document.getElementById("coins");
const tapSound = document.getElementById("tapSound");

// ------------------------------
//  SOUND FIX (Telegram restriction)
// ------------------------------
let soundEnabled = false;

// After first click anywhere IN the webapp, sound unlocks
document.addEventListener("click", () => {
    soundEnabled = true;
}, { once: true });

function playSound() {
    if (!soundEnabled) return;
    tapSound.currentTime = 0;
    tapSound.play().catch(err => {
        console.log("Sound blocked:", err);
    });
}

// ------------------------------
//  TAP LOGIC
// ------------------------------
let coins = 0;

tapButton.addEventListener("click", () => {
    coins++;
    coinsDisplay.textContent = coins;

    playSound();   // play tap sound AFTER first interaction

    // Send data to the bot
    tg.sendData(JSON.stringify({
        taps: 1
    }));
});
