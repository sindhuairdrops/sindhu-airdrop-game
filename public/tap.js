// --------------------------------------
// Telegram WebApp Init
// --------------------------------------
const tg = window.Telegram.WebApp;
tg.expand();

// Elements
const tapButton = document.getElementById("tapButton");
const totalCoinsEl = document.getElementById("totalCoins");
const todayText = document.getElementById("todayText");
const tapSound = document.getElementById("tapSound");

// Telegram sound unlock
let soundEnabled = false;
document.addEventListener("click", () => {
    soundEnabled = true;
}, { once: true });

function playSound() {
    if (!soundEnabled) return;
    if (tapSound) {
        tapSound.currentTime = 0;
        tapSound.play().catch(() => {});
    }
}

let totalCoins = 0;
let todayTaps = 0;

// 🔥 Smooth animation for total coins
function animateCoins(newCoins) {
    let start = totalCoins;
    let end = newCoins;
    let duration = 200;
    let startTime = performance.now();

    function update(time) {
        let progress = Math.min((time - startTime) / duration, 1);
        totalCoinsEl.textContent = Math.floor(start + (end - start) * progress);
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);

    totalCoins = newCoins;
}

// ⭐ Update today's tap counter text
function updateTodayText() {
    todayText.innerText = `Taps today: ${todayTaps}/200`;
}

// --------------------------------------
// Tap Button Handler
// --------------------------------------
tapButton.addEventListener("click", () => {
    if (todayTaps >= 200) {
        tg.showAlert("⚠️ Daily limit reached (200)");
        return;
    }

    // PLAY SOUND & VIBRATE
    playSound();
    if (navigator.vibrate) navigator.vibrate(30);

    // UPDATE LOCAL DATA
    todayTaps++;
    updateTodayText();

    totalCoins++;
    animateCoins(totalCoins);

    // SEND TAP TO TELEGRAM
    tg.sendData(JSON.stringify({
        taps: 1
    }));
});

// --------------------------------------
// FETCH initial user stats from backend
// --------------------------------------
fetch("/user/info")
  .then(r => r.json())
  .then(data => {
      totalCoins = data.total_coins || 0;
      todayTaps = data.today_taps || 0;

      totalCoinsEl.textContent = totalCoins;
      updateTodayText();
  })
  .catch(() => {
      console.log("User stats not loaded (optional)");
  });
