const tg = window.Telegram.WebApp;
tg.expand();

const tapBtn = document.getElementById("tapButton");
const totalCoins = document.getElementById("totalCoins");
const todayCoins = document.getElementById("todayCoins");
const scrollMessage = document.getElementById("scrollingMessage");
const tapSound = document.getElementById("tapSound");

let soundEnabled = false;

document.addEventListener("click", () => { soundEnabled = true; }, { once: true });

function playTap() {
    if (soundEnabled) tapSound.play().catch(()=>{});
    if (navigator.vibrate) navigator.vibrate(50);
}

/* FETCH INITIAL DATA */
async function loadStats() {
    const userId = tg.initDataUnsafe.user.id;

    const res = await fetch(`/api/user-info/${userId}`);
    const data = await res.json();

    totalCoins.textContent = data.total || 0;
    todayCoins.textContent = data.today || 0;
}

async function loadScrollingMessage() {
    const res = await fetch("/admin/message");
    const msg = await res.text();
    scrollMessage.textContent = msg || "Welcome to Sindhu Airdrop!";
}

loadStats();
loadScrollingMessage();

/* TAP LOGIC */
tapBtn.addEventListener("click", () => {
    playTap();

    tg.sendData(JSON.stringify({ taps: 1 }));
});
