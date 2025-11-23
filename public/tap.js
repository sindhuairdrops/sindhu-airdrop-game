const tg = window.Telegram.WebApp;

let userId = tg.initDataUnsafe.user?.id;

const tapSound = document.getElementById("tapSound");

// Buy / Chart buttons
document.getElementById("buyBtn").onclick = () => {
    tg.openLink("https://quickswap.exchange");
};
document.getElementById("priceBtn").onclick = () => {
    tg.openLink("https://www.geckoterminal.com");
};

// Load user stats from server
async function loadStats() {
    const res = await fetch(`/api/user/${userId}`);
    const data = await res.json();

    document.getElementById("totalCoins").innerText = data.total;
    document.getElementById("todayCoins").innerText = data.today;

    document.getElementById("scrollingMessage").innerText = data.message;
}

loadStats();

// Tap to earn
document.getElementById("tapButton").addEventListener("click", async () => {

    tapSound.currentTime = 0;
    tapSound.play();

    const res = await fetch("/api/tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
    });

    const data = await res.json();

    document.getElementById("totalCoins").innerText = data.total;
    document.getElementById("todayCoins").innerText = data.today;
});
