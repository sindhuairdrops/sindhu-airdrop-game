// --------------------------------------
// Telegram WebApp API Init
// --------------------------------------
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Elements
const tapButton = document.getElementById("tapButton");
const coinsDisplay = document.getElementById("coins");
const tapSound = document.getElementById("tapSound");
const info = document.querySelector(".tap-info");

// Unlock audio after first user click
let soundEnabled = false;
document.addEventListener("click", () => soundEnabled = true, { once: true });

function playSound() {
    if (!soundEnabled) return;
    tapSound.currentTime = 0;
    tapSound.play().catch(() => {});
}

// --------------------------------------
// Load local user progress
// --------------------------------------
let totalCoins = Number(localStorage.getItem("totalCoins") || 0);
let dailyTaps = Number(localStorage.getItem("dailyTaps") || 0);
let lastLogin = localStorage.getItem("lastLoginDate") || "";

// --------------------------------------
// DAILY RESET (midnight)
// --------------------------------------
function checkDailyReset() {
    const today = new Date().toLocaleDateString();

    if (lastLogin !== today) {
        // NEW DAY → Reset
        dailyTaps = 0;
        localStorage.setItem("dailyTaps", 0);

        // STORE NEW DATE
        lastLogin = today;
        localStorage.setItem("lastLoginDate", today);

        // Give daily login bonus +100
        totalCoins += 100;
        localStorage.setItem("totalCoins", totalCoins);

        tg.sendData(JSON.stringify({ daily_bonus: 100 }));

        info.textContent = "🎉 Daily Login Bonus +100!";
        setTimeout(() => info.textContent = "Tap the logo to earn coins!", 2000);
    }
}
checkDailyReset();

// --------------------------------------
// Smooth Counter Animation
// --------------------------------------
function animateCoins(newCoins) {
    let start = totalCoins;
    let end = newCoins;
    let duration = 250;
    let startTime = performance.now();

    function update(time) {
        let progress = Math.min((time - startTime) / duration, 1);
        coinsDisplay.textContent = Math.floor(start + (end - start) * progress);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// Load initial
coinsDisplay.textContent = totalCoins;

// --------------------------------------
// TAP LOGIC (limit 200/day)
// --------------------------------------
tapButton.addEventListener("click", () => {
    if (dailyTaps >= 200) {
        info.textContent = "⚠️ Daily limit reached (200)";
        return;
    }

    dailyTaps++;
    totalCoins++;

    // Save to device
    localStorage.setItem("dailyTaps", dailyTaps);
    localStorage.setItem("totalCoins", totalCoins);

    animateCoins(totalCoins);
    playSound();

    if (navigator.vibrate) navigator.vibrate(40);

    // Send Tap Event to Telegram Bot
    tg.sendData(JSON.stringify({ taps: 1 }));

    info.textContent = `Taps today: ${dailyTaps}/200`;
});
