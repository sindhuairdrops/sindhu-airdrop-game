let tg = window.Telegram.WebApp;
tg.expand();

// Elements
const totalCoinsEl = document.getElementById("totalCoins");
const todayCoinsEl = document.getElementById("todayCoins");
const tapButton = document.getElementById("tapButton");
const tapSound = document.getElementById("tapSound");

// Load scrolling message
fetch("/admin/message")
  .then(r => r.text())
  .then(msg => {
      document.getElementById("scrollingMessage").innerText = msg || "Welcome to Sindhu Airdrop!";
  });

// Fetch user info on load
let userId = tg.initDataUnsafe.user?.id;

if (!userId) {
    alert("Telegram WebApp ID missing!");
}

function loadUser() {
    fetch(`/api/userinfo?id=${userId}`)
    .then(res => res.json())
    .then(d => {
        totalCoinsEl.innerText = d.total || 0;
        todayCoinsEl.innerText = d.today || 0;
    });
}

loadUser();

// Tap counter
let tapCount = 1;

tapButton.addEventListener("click", () => {
    tapSound.currentTime = 0;
    tapSound.play();

    tapCount++;

    // Send to bot
    tg.sendData(JSON.stringify({
        taps: 1
    }));

    loadUser();
});

// Buttons
document.getElementById("buyBtn").onclick = () => {
    tg.openLink("https://sindhucoin.in.net");
};

document.getElementById("priceBtn").onclick = () => {
    tg.openLink("https://sindhucoin.in.net");
};
