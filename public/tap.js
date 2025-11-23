const tg = window.Telegram.WebApp;

// Expand WebApp
tg.expand();

// DOM elements
const tapButton = document.getElementById("tapButton");
const tapSound = document.getElementById("tapSound");

const totalCoinsEl = document.getElementById("totalCoins");
const todayCoinsEl = document.getElementById("todayCoins");
const scrollMsg = document.getElementById("scrollingMessage");

// Buy Buttons
document.getElementById("buyBtn").onclick = () => {
    tg.openLink("https://sindhucoin.in.net/buy"); // You can change later
};

document.getElementById("priceBtn").onclick = () => {
    tg.openLink("https://sindhucoin.in.net/price");
};

// Load user data from server
async function loadStats() {
    try {
        const res = await fetch("/api/userstats?id=" + tg.initDataUnsafe.user.id);
        const data = await res.json();

        totalCoinsEl.innerText = data.total || 0;
        todayCoinsEl.innerText = data.today || 0;
    } catch (err) {
        console.error("Stats load error", err);
    }
}

// Load scrolling message
async function loadMessage() {
    try {
        const res = await fetch("/admin/message");
        const msg = await res.text();
        scrollMsg.innerText = msg || "Welcome to Sindhu Airdrop!";
    } catch {
        scrollMsg.innerText = "Welcome to Sindhu Airdrop!";
    }
}

// Handle Tap
tapButton.addEventListener("click", () => {
    tapSound.play();

    tg.sendData(JSON.stringify({ taps: 1 }));

    // Update UI instantly
    let today = parseInt(todayCoinsEl.innerText) + 1;
    let total = parseInt(totalCoinsEl.innerText) + 1;

    todayCoinsEl.innerText = today;
    totalCoinsEl.innerText = total;
});

// Start
loadStats();
loadMessage();
