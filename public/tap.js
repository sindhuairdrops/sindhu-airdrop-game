const tg = window.Telegram.WebApp;
tg.expand();

const totalCoins = document.getElementById("totalCoins");
const todayCoins = document.getElementById("todayCoins");
const tapSound = document.getElementById("tapSound");
const tapButton = document.getElementById("tapButton");
const livePrice = document.getElementById("livePrice");

// SOUND UNLOCK FIX
let soundEnabled = false;
document.addEventListener("click", () => soundEnabled = true, { once: true });

function playTap() {
    if (!soundEnabled) return;
    tapSound.currentTime = 0;
    tapSound.play().catch(() => {});
}

/* -----------------------
   TAP + SEND TO BOT
------------------------ */
let total = 0;
let today = 0;

tapButton.addEventListener("click", () => {
    if (today >= 200) return;

    total++;
    today++;

    totalCoins.textContent = total;
    todayCoins.textContent = today;

    playTap();

    tg.sendData(JSON.stringify({ taps: 1 }));
});

/* -----------------------
   COINGECKO LIVE PRICE
------------------------ */
async function loadPrice() {
    try {
        const res = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true"
        );

        const data = await res.json();

        // 👉 Replace later with your real Coin ID
        livePrice.textContent = "$" + data.bitcoin.usd;

    } catch (e) {
        livePrice.textContent = "⚠ Error loading price";
    }
}

setInterval(loadPrice, 10000);
loadPrice();

/* -----------------------
   MINI PRICE CHART
------------------------ */
const ctx = document.getElementById("priceChart");

let chart;

async function loadChart() {
    const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1"
    );
    const priceData = await res.json();

    const prices = priceData.prices.map(p => p[1]);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: prices.map((_, i) => i),
            datasets: [{
                data: prices,
                borderColor: "gold",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

loadChart();
setInterval(loadChart, 15000);
