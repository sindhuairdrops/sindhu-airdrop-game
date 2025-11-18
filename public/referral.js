const tg = window.Telegram.WebApp;

tg.ready();
const uid = tg.initDataUnsafe.user.id;

document.getElementById("refLink").innerHTML =
    `https://t.me/${tg.initDataUnsafe?.bot?.username}?start=${uid}`;
