const tg = window.Telegram.WebApp;
tg.expand();

const userId = tg.initDataUnsafe.user?.id;
const botUsername = "SindhuAirdrop_bot";

const link = `https://t.me/${botUsername}?start=${userId}`;
document.getElementById("ref").value = link;

function copyLink() {
    navigator.clipboard.writeText(link);
    tg.showAlert("Referral link copied!");
}
