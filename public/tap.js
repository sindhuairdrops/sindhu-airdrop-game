// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// DOM Elements
const totalCoinsEl = document.getElementById("totalCoins");
const todayCoinsEl = document.getElementById("todayCoins");
const tapButton = document.getElementById("tapButton");
const scrollingMessage = document.getElementById("scrollingMessage");
const buyBtn = document.getElementById("buyBtn");
const priceBtn = document.getElementById("priceBtn");
const tapSound = document.getElementById("tapSound");

let totalCoins = 0;
let todayCoins = 0;
let dailyBonusGiven = false;
let soundEnabled = false;

// Unlock sound
document.addEventListener("click", () => { soundEnabled = true; }, { once: true });

function playSound() {
    if (!soundEnabled) return;
    tapSound.currentTime = 0;
    tapSound.play().catch(() => {});
}

// Fetch User Initial Data
async function loadUserData() {
    try {
        const id = tg.initDataUnsafe.user.id;

        const res = await fetch(`/api/user/${id}`);
        const data = await res.json();

        totalCoins = data.total;
        todayCoins = data.today;

        totalCoinsEl.textContent = totalCoins;
        todayCoinsEl.textContent = todayCoins;

        scrollingMessage.textContent = data.message || "Welcome to Sindhu Airdrop!";
    } catch (e) {
        console.log("User load error:", e);
    }
}

loadUserData();

// Tap Action
tapButton.addEventListener("click", () => {
    if (todayCoins >= 200) {
        tg.showAlert("⚠️ Daily tap limit reached (200)");
        return;
    }

    // Add coin locally
    totalCoins++;
    todayCoins++;

    totalCoinsEl.textContent = totalCoins;
    todayCoinsEl.textContent = todayCoins;

    playSound();

    if (navigator.vibrate) navigator.vibrate(40);

    // Send 1 tap to Telegram Bot
    tg.sendData(JSON.stringify({ taps: 1 }));
});

// Give Daily Bonus Once Per Day
setTimeout(() => {
    if (!dailyBonusGiven) {
        tg.sendData(JSON.stringify({ daily_bonus: 100 }));
        dailyBonusGiven = true;

        totalCoins += 100;
        todayCoins += 100;

        totalCoinsEl.textContent = totalCoins;
        todayCoinsEl.textContent = todayCoins;

        tg.showAlert("🎉 Daily Login Bonus +100");
    }
}, 1200);

// Buttons — you will update links later
buyBtn.href = "https://sindhucoin.in.net/buy";  
priceBtn.href = "https://sindhucoin.in.net/chart";
