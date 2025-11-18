const tg = window.Telegram.WebApp;

let coins = 0;
let taps = 0;

const coinDisplay = document.getElementById("coins");
const tapBtn = document.getElementById("tapButton");
const tapSound = document.getElementById("tapSound");

// For smooth opening
tg.expand();

tapBtn.addEventListener("click", () => {
  taps++;
  coins++;
  coinDisplay.innerText = coins;

  tapSound.currentTime = 0;
  tapSound.play();

  if (taps >= 25) {
    tg.sendData(JSON.stringify({ taps }));
    taps = 0;
  }
});
