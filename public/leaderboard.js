const tg = window.Telegram.WebApp;
tg.expand();

fetch("/admin/users")
  .then(r => r.json())
  .then(data => {
      let html = "";
      data.slice(0, 10).forEach((u, i) => {
          html += `<p>${i + 1}. User ${u.id} — ${u.coins} 🪙</p>`;
      });
      document.getElementById("board").innerHTML = html;
  });
