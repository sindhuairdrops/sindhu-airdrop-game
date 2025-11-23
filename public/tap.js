const tg = window.Telegram.WebApp;
tg.expand();

const tapButton = document.getElementById("tapButton");
const totalCoinsElement = document.getElementById("totalCoins");
const todayCoinsElement = document.getElementById("todayCoins");
const tapSound = document.getElementById("tapSound");
let soundEnabled = false;

document.addEventListener("click", () => soundEnabled = true, { once: true });

function playSound() {
    if (!soundEnabled) return;
    tapSound.currentTime = 0;
    tapSound.play().catch(() => {});
}

/* Load initial values */
async function loadStats() {
    try {
        const res = await fetch("/api/user-stats");
        const data = await res.json();

        totalCoinsElement.textContent = data.total || 0;
        todayCoinsElement.textContent = data.today || 0;

        if (data.message) {
            document.getElementById("scrollingMessage").textContent = data.message;
        }
    } catch (e) {
        console.error("Stats load error:", e);
    }
}

loadStats();

/* Tap handler */
tapButton.addEventListener("click", async () => {
    tapButton.classList.add("tapBounce");
    setTimeout(() => tapButton.classList.remove("tapBounce"), 250);

    playSound();

    try {
        const res = await fetch("/api/tap", { method: "POST" });
        const data = await res.json();

        totalCoinsElement.textContent = data.total;
        todayCoinsElement.textContent = data.today;

        if (data.limitReached) {
            tg.showAlert("⚠️ Daily limit 200 reached");
        }
    } catch (e) {
        console.error("Tap error:", e);
    }
});

/* Buttons */
document.getElementById("buyBtn").onclick = () => {
    window.open("https://quickswap.exchange", "_blank");
};

document.getElementById("priceBtn").onclick = () => {
    window.open("https://www.geckoterminal.com", "_blank");
};
